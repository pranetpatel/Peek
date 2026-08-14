import { db } from "@/lib/db";
import { hobbies, profileHobbies, profileValues, profiles, values as valuesTable } from "@/lib/db/schema";
import { and, inArray, notInArray, sql } from "drizzle-orm";

const BATCH_SIZE = 10;

export type BrowseCard = {
  id: string;
  displayName: string;
  age: number;
  bio: string | null;
  promptSnippet: { question: string; answer: string } | null;
  primaryPhotoPath: string | null;
  compatibilityPercent: number;
  sharedHobbies: string[];
  sharedValues: string[];
};

function calculateAge(birthdate: string): number {
  const today = new Date();
  const dob = new Date(birthdate);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Fetches the next batch of browse candidates ranked by shared hobby/value
 * tag overlap against the current user's own selections. This is a
 * placeholder heuristic for v1 — not a real compatibility algorithm.
 */
export async function getBrowseBatch(input: {
  currentProfileId: string;
  interestedIn: string[];
  excludeIds: string[];
}): Promise<BrowseCard[]> {
  const { currentProfileId, interestedIn, excludeIds } = input;

  const [myHobbyIds, myValueIds] = await Promise.all([
    db.query.profileHobbies
      .findMany({ where: (t, { eq }) => eq(t.profileId, currentProfileId) })
      .then((rows) => rows.map((r) => r.hobbyId)),
    db.query.profileValues
      .findMany({ where: (t, { eq }) => eq(t.profileId, currentProfileId) })
      .then((rows) => rows.map((r) => r.valueId)),
  ]);
  const myTotalTags = myHobbyIds.length + myValueIds.length;

  const excludeClause = excludeIds.length > 0 ? notInArray(profiles.id, excludeIds) : undefined;
  const interestedInClause =
    interestedIn.length > 0 ? inArray(profiles.gender, interestedIn) : undefined;

  // The outer profiles.id has to be spelled out: drizzle renders bare column
  // names inside these correlated subqueries, which would bind to the inner
  // table instead.
  const sharedHobbiesExpr = myHobbyIds.length
    ? sql<number>`(select count(*) from ${profileHobbies} where ${profileHobbies.profileId} = "profiles"."id" and ${profileHobbies.hobbyId} in (${sql.join(
        myHobbyIds.map((id) => sql`${id}::uuid`),
        sql`, `
      )}))`
    : sql<number>`0`;
  const sharedValuesExpr = myValueIds.length
    ? sql<number>`(select count(*) from ${profileValues} where ${profileValues.profileId} = "profiles"."id" and ${profileValues.valueId} in (${sql.join(
        myValueIds.map((id) => sql`${id}::uuid`),
        sql`, `
      )}))`
    : sql<number>`0`;

  const candidates = await db
    .select({
      id: profiles.id,
      displayName: profiles.displayName,
      birthdate: profiles.birthdate,
      bio: profiles.bio,
      prompts: profiles.prompts,
      sharedHobbies: sharedHobbiesExpr.as("shared_hobbies"),
      sharedValues: sharedValuesExpr.as("shared_values"),
    })
    .from(profiles)
    .where(
      and(
        sql`${profiles.id} != ${currentProfileId}`,
        sql`${profiles.onboardingCompletedAt} is not null`,
        interestedInClause,
        excludeClause
      )
    )
    // Postgres only accepts a bare output alias in ORDER BY, never one inside
    // an expression, so the overlap counts are repeated here.
    .orderBy(sql`(${sharedHobbiesExpr} + ${sharedValuesExpr}) desc, random()`)
    .limit(BATCH_SIZE);

  if (candidates.length === 0) return [];

  const candidateIds = candidates.map((c) => c.id);

  const [primaryPhotos, sharedHobbyRows, sharedValueRows] = await Promise.all([
    db.query.photos.findMany({
      where: (t, { and, eq, inArray }) => and(inArray(t.profileId, candidateIds), eq(t.position, 0)),
    }),
    myHobbyIds.length
      ? db
          .select({ profileId: profileHobbies.profileId, label: hobbies.label })
          .from(profileHobbies)
          .innerJoin(hobbies, sql`${hobbies.id} = ${profileHobbies.hobbyId}`)
          .where(
            and(inArray(profileHobbies.profileId, candidateIds), inArray(profileHobbies.hobbyId, myHobbyIds))
          )
      : Promise.resolve([]),
    myValueIds.length
      ? db
          .select({ profileId: profileValues.profileId, label: valuesTable.label })
          .from(profileValues)
          .innerJoin(valuesTable, sql`${valuesTable.id} = ${profileValues.valueId}`)
          .where(
            and(inArray(profileValues.profileId, candidateIds), inArray(profileValues.valueId, myValueIds))
          )
      : Promise.resolve([]),
  ]);

  const photoByProfile = new Map(primaryPhotos.map((p) => [p.profileId, p.storagePath]));
  const hobbiesByProfile = new Map<string, string[]>();
  for (const row of sharedHobbyRows) {
    hobbiesByProfile.set(row.profileId, [...(hobbiesByProfile.get(row.profileId) ?? []), row.label]);
  }
  const valuesByProfile = new Map<string, string[]>();
  for (const row of sharedValueRows) {
    valuesByProfile.set(row.profileId, [...(valuesByProfile.get(row.profileId) ?? []), row.label]);
  }

  return candidates.map((c) => {
    const sharedCount = Number(c.sharedHobbies) + Number(c.sharedValues);
    const prompts = c.prompts as { question: string; answer: string }[] | null;
    return {
      id: c.id,
      displayName: c.displayName,
      age: calculateAge(c.birthdate),
      bio: c.bio,
      promptSnippet: prompts && prompts.length > 0 ? prompts[0] : null,
      primaryPhotoPath: photoByProfile.get(c.id) ?? null,
      compatibilityPercent: myTotalTags > 0 ? Math.round((sharedCount / myTotalTags) * 100) : 0,
      sharedHobbies: hobbiesByProfile.get(c.id) ?? [],
      sharedValues: valuesByProfile.get(c.id) ?? [],
    };
  });
}
