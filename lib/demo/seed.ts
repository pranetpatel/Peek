import { db } from "@/lib/db";
import {
  hobbies,
  likes,
  matches,
  messages,
  photos,
  profileHobbies,
  profileValues,
  profiles,
  values as valuesTable,
} from "@/lib/db/schema";
import { HOBBY_DATA, VALUES_DATA, taxonomySlug } from "@/lib/db/taxonomyData";
import { inArray, or } from "drizzle-orm";
import {
  ALL_DEMO_IDS,
  CAST,
  INCOMING_LIKES,
  PERSONAS,
  SCRIPTED_MATCHES,
  demoPhotoPaths,
  demoProfileId,
  type DemoProfileSpec,
} from "./data";

const CAST_PHOTO_COUNT = 2;

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000);
}

/** Ensures the hobby/value taxonomy exists — onboarding pickers read from it. */
async function ensureTaxonomy() {
  for (const [categoryIndex, group] of HOBBY_DATA.entries()) {
    for (const [itemIndex, label] of group.items.entries()) {
      await db
        .insert(hobbies)
        .values({
          slug: taxonomySlug(label),
          label,
          category: group.category,
          sortOrder: categoryIndex * 100 + itemIndex,
        })
        .onConflictDoUpdate({ target: hobbies.slug, set: { label, category: group.category } });
    }
  }

  for (const [index, item] of VALUES_DATA.entries()) {
    await db
      .insert(valuesTable)
      .values({
        slug: taxonomySlug(item.label),
        label: item.label,
        description: item.description,
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: valuesTable.slug,
        set: { label: item.label, description: item.description },
      });
  }

  const [hobbyRows, valueRows] = await Promise.all([
    db.query.hobbies.findMany(),
    db.query.values.findMany(),
  ]);

  return {
    hobbyIdByLabel: new Map(hobbyRows.map((h) => [h.label, h.id])),
    valueIdByLabel: new Map(valueRows.map((v) => [v.label, v.id])),
  };
}

async function upsertDemoProfile(
  spec: DemoProfileSpec,
  opts: { onboarded: boolean; photoCount: number },
  taxonomy: { hobbyIdByLabel: Map<string, string>; valueIdByLabel: Map<string, string> }
) {
  const id = demoProfileId(spec.key);
  const row = {
    displayName: spec.displayName,
    birthdate: spec.birthdate,
    gender: spec.gender,
    interestedIn: spec.interestedIn,
    bio: spec.bio || null,
    locationText: spec.locationText || null,
    prompts: spec.prompts.length > 0 ? spec.prompts : null,
    onboardingCompletedAt: opts.onboarded ? new Date() : null,
    updatedAt: new Date(),
  };

  await db
    .insert(profiles)
    .values({ id, ...row })
    .onConflictDoUpdate({ target: profiles.id, set: row });

  // Photos, hobbies and values are rewritten wholesale so a persona that was
  // edited mid-demo (extra uploads, retagged interests) snaps back to spec.
  await db.delete(photos).where(inArray(photos.profileId, [id]));
  const paths = demoPhotoPaths(spec.key, opts.photoCount);
  if (paths.length > 0) {
    await db.insert(photos).values(paths.map((storagePath, position) => ({ profileId: id, storagePath, position })));
  }

  await db.delete(profileHobbies).where(inArray(profileHobbies.profileId, [id]));
  const hobbyIds = spec.hobbyLabels
    .map((label) => taxonomy.hobbyIdByLabel.get(label))
    .filter((v): v is string => Boolean(v));
  if (hobbyIds.length > 0) {
    await db.insert(profileHobbies).values(hobbyIds.map((hobbyId) => ({ profileId: id, hobbyId })));
  }

  await db.delete(profileValues).where(inArray(profileValues.profileId, [id]));
  const valueIds = spec.valueLabels
    .map((label) => taxonomy.valueIdByLabel.get(label))
    .filter((v): v is string => Boolean(v));
  if (valueIds.length > 0) {
    await db.insert(profileValues).values(valueIds.map((valueId) => ({ profileId: id, valueId })));
  }
}

/** Drops every like/match/message that touches a demo profile. */
async function clearDemoRelations() {
  const demoMatches = await db.query.matches.findMany({
    where: (t, { or, inArray }) =>
      or(inArray(t.profileOneId, ALL_DEMO_IDS), inArray(t.profileTwoId, ALL_DEMO_IDS)),
  });
  const matchIds = demoMatches.map((m) => m.id);

  if (matchIds.length > 0) {
    await db.delete(messages).where(inArray(messages.matchId, matchIds));
    await db.delete(matches).where(inArray(matches.id, matchIds));
  }
  await db
    .delete(likes)
    .where(or(inArray(likes.likerId, ALL_DEMO_IDS), inArray(likes.likedId, ALL_DEMO_IDS)));
}

async function seedScriptedRelations() {
  for (const [personaKey, castKeys] of Object.entries(INCOMING_LIKES)) {
    const likedId = demoProfileId(personaKey);
    for (const castKey of castKeys) {
      await db
        .insert(likes)
        .values({ likerId: demoProfileId(castKey), likedId })
        .onConflictDoNothing({ target: [likes.likerId, likes.likedId] });
    }
  }

  for (const scripted of SCRIPTED_MATCHES) {
    const personaId = demoProfileId(scripted.personaKey);
    const castId = demoProfileId(scripted.castKey);

    // Both sides liked each other — that's what a match means in this schema.
    await db
      .insert(likes)
      .values([
        { likerId: personaId, likedId: castId },
        { likerId: castId, likedId: personaId },
      ])
      .onConflictDoNothing();

    const [profileOneId, profileTwoId] = personaId < castId ? [personaId, castId] : [castId, personaId];
    const [match] = await db
      .insert(matches)
      .values({ profileOneId, profileTwoId, createdAt: minutesAgo(scripted.matchedMinutesAgo) })
      .returning({ id: matches.id });

    if (scripted.messages.length > 0) {
      await db.insert(messages).values(
        scripted.messages.map((m) => ({
          matchId: match.id,
          senderId: m.from === "persona" ? personaId : castId,
          body: m.body,
          createdAt: minutesAgo(m.minutesAgo),
        }))
      );
    }
  }
}

/**
 * Rebuilds the entire demo dataset: taxonomy, personas, cast, and the scripted
 * likes/matches/messages. Idempotent — every demo row has a fixed id, and
 * relations are cleared before being re-seeded, so a reset is just a re-run.
 */
export async function resetDemoData() {
  const taxonomy = await ensureTaxonomy();

  await clearDemoRelations();

  for (const persona of PERSONAS) {
    await upsertDemoProfile(persona, { onboarded: persona.onboarded, photoCount: persona.photoCount }, taxonomy);
  }
  for (const spec of CAST) {
    await upsertDemoProfile(spec, { onboarded: true, photoCount: CAST_PHOTO_COUNT }, taxonomy);
  }

  await seedScriptedRelations();
}

/** Seeds only if the demo dataset is missing, so entering demo mode is cheap. */
export async function ensureDemoData() {
  const existing = await db.query.profiles.findFirst({
    where: (t, { inArray }) => inArray(t.id, ALL_DEMO_IDS),
  });
  if (existing) return;
  await resetDemoData();
}

export async function getDemoDataStatus() {
  const rows = await db.query.profiles.findMany({
    where: (t, { inArray }) => inArray(t.id, ALL_DEMO_IDS),
    columns: { id: true },
  });
  return { seededProfiles: rows.length, expectedProfiles: ALL_DEMO_IDS.length };
}
