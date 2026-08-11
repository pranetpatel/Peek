import { db } from "@/lib/db";
import {
  hobbies,
  matches,
  messages,
  photos,
  profileHobbies,
  profileValues,
  profiles,
  values as valuesTable,
} from "@/lib/db/schema";
import { and, eq, inArray, or, sql } from "drizzle-orm";

export type MatchListItem = {
  id: string;
  otherProfileId: string;
  otherDisplayName: string;
  otherPrimaryPhotoPath: string | null;
  lastMessageBody: string | null;
  lastMessageAt: Date | null;
  matchedAt: Date;
};

function normalizePair(profileAId: string, profileBId: string): [string, string] {
  return profileAId < profileBId ? [profileAId, profileBId] : [profileBId, profileAId];
}

/**
 * Inserts a match if `profileBId` already liked `profileAId` (a mutual like).
 * Safe to call on every like — it's a no-op if there's no reverse like yet,
 * and idempotent (via onConflictDoNothing) if the match already exists.
 */
export async function createMatchIfMutual(
  profileAId: string,
  profileBId: string
): Promise<{ id: string } | null> {
  const reverseLike = await db.query.likes.findFirst({
    where: (t, { and, eq }) => and(eq(t.likerId, profileBId), eq(t.likedId, profileAId)),
  });
  if (!reverseLike) return null;

  const [profileOneId, profileTwoId] = normalizePair(profileAId, profileBId);

  const [inserted] = await db
    .insert(matches)
    .values({ profileOneId, profileTwoId })
    .onConflictDoNothing({ target: [matches.profileOneId, matches.profileTwoId] })
    .returning({ id: matches.id });
  if (inserted) return inserted;

  const existing = await db.query.matches.findFirst({
    where: (t, { and, eq }) => and(eq(t.profileOneId, profileOneId), eq(t.profileTwoId, profileTwoId)),
  });
  return existing ? { id: existing.id } : null;
}

export async function getMatchById(matchId: string) {
  return db.query.matches.findFirst({ where: eq(matches.id, matchId) });
}

/** Sole authorization gate for chat routes/actions — there is no Supabase RLS in this stack. */
export async function assertMatchMembership(matchId: string, userId: string) {
  const match = await getMatchById(matchId);
  if (!match) return null;
  if (match.profileOneId !== userId && match.profileTwoId !== userId) return null;
  return match;
}

export function otherProfileId(match: { profileOneId: string; profileTwoId: string }, myId: string) {
  return match.profileOneId === myId ? match.profileTwoId : match.profileOneId;
}

export async function getMatchesForProfile(profileId: string): Promise<MatchListItem[]> {
  const lastMessageBodyExpr = sql<string | null>`(select ${messages.body} from ${messages} where ${messages.matchId} = ${matches.id} order by ${messages.createdAt} desc limit 1)`;
  const lastMessageAtExpr = sql<Date | null>`(select ${messages.createdAt} from ${messages} where ${messages.matchId} = ${matches.id} order by ${messages.createdAt} desc limit 1)`;

  const rows = await db
    .select({
      id: matches.id,
      profileOneId: matches.profileOneId,
      profileTwoId: matches.profileTwoId,
      createdAt: matches.createdAt,
      lastMessageBody: lastMessageBodyExpr.as("last_message_body"),
      lastMessageAt: lastMessageAtExpr.as("last_message_at"),
    })
    .from(matches)
    .where(or(eq(matches.profileOneId, profileId), eq(matches.profileTwoId, profileId)))
    .orderBy(sql`coalesce(last_message_at, ${matches.createdAt}) desc`);

  if (rows.length === 0) return [];

  const otherIds = rows.map((r) => (r.profileOneId === profileId ? r.profileTwoId : r.profileOneId));

  const [otherProfiles, primaryPhotos] = await Promise.all([
    db.query.profiles.findMany({ where: inArray(profiles.id, otherIds) }),
    db.query.photos.findMany({
      where: and(inArray(photos.profileId, otherIds), eq(photos.position, 0)),
    }),
  ]);
  const profileById = new Map(otherProfiles.map((p) => [p.id, p]));
  const photoByProfile = new Map(primaryPhotos.map((p) => [p.profileId, p.storagePath]));

  return rows.map((r) => {
    const otherId = r.profileOneId === profileId ? r.profileTwoId : r.profileOneId;
    return {
      id: r.id,
      otherProfileId: otherId,
      otherDisplayName: profileById.get(otherId)?.displayName ?? "Unknown",
      otherPrimaryPhotoPath: photoByProfile.get(otherId) ?? null,
      lastMessageBody: r.lastMessageBody,
      lastMessageAt: r.lastMessageAt,
      matchedAt: r.createdAt,
    };
  });
}

/**
 * Hobbies/values both profiles in a match actually share, resolved the same
 * two-step (ids, then labels) way browse.ts computes overlap.
 */
export async function getSharedAttributesForMatch(profileAId: string, profileBId: string) {
  const [aHobbyRows, bHobbyRows, aValueRows, bValueRows] = await Promise.all([
    db.query.profileHobbies.findMany({ where: eq(profileHobbies.profileId, profileAId) }),
    db.query.profileHobbies.findMany({ where: eq(profileHobbies.profileId, profileBId) }),
    db.query.profileValues.findMany({ where: eq(profileValues.profileId, profileAId) }),
    db.query.profileValues.findMany({ where: eq(profileValues.profileId, profileBId) }),
  ]);

  const bHobbyIds = new Set(bHobbyRows.map((r) => r.hobbyId));
  const sharedHobbyIds = aHobbyRows.map((r) => r.hobbyId).filter((id) => bHobbyIds.has(id));

  const bValueIds = new Set(bValueRows.map((r) => r.valueId));
  const sharedValueIds = aValueRows.map((r) => r.valueId).filter((id) => bValueIds.has(id));

  const [sharedHobbies, sharedValues] = await Promise.all([
    sharedHobbyIds.length ? db.query.hobbies.findMany({ where: inArray(hobbies.id, sharedHobbyIds) }) : [],
    sharedValueIds.length
      ? db.query.values.findMany({ where: inArray(valuesTable.id, sharedValueIds) })
      : [],
  ]);

  return {
    sharedHobbies: sharedHobbies.map((h) => ({ slug: h.slug, label: h.label })),
    sharedValues: sharedValues.map((v) => ({ slug: v.slug, label: v.label })),
  };
}
