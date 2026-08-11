import { db } from "@/lib/db";
import { photos, profileHobbies, profileValues, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getProfileById(profileId: string) {
  return db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
  });
}

export async function createBareProfile(input: {
  id: string;
  displayName: string;
  birthdate: string;
  gender: string;
  interestedIn: string[];
}) {
  const [profile] = await db
    .insert(profiles)
    .values(input)
    .onConflictDoNothing({ target: profiles.id })
    .returning();
  return profile;
}

export async function updateProfileBasicInfo(
  profileId: string,
  input: {
    displayName: string;
    birthdate: string;
    gender: string;
    interestedIn: string[];
    bio?: string;
    locationText?: string;
    prompts?: { question: string; answer: string }[];
  }
) {
  const [profile] = await db
    .update(profiles)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(profiles.id, profileId))
    .returning();
  return profile;
}

export async function completeOnboarding(profileId: string) {
  const [profile] = await db
    .update(profiles)
    .set({ onboardingCompletedAt: new Date(), updatedAt: new Date() })
    .where(eq(profiles.id, profileId))
    .returning();
  return profile;
}

export async function getProfilePhotos(profileId: string) {
  return db.query.photos.findMany({
    where: eq(photos.profileId, profileId),
    orderBy: (photos, { asc }) => [asc(photos.position)],
  });
}

export async function addProfilePhoto(profileId: string, storagePath: string, position: number) {
  const [photo] = await db
    .insert(photos)
    .values({ profileId, storagePath, position })
    .returning();
  return photo;
}

export async function setProfileHobbies(profileId: string, hobbyIds: string[]) {
  await db.transaction(async (tx) => {
    await tx.delete(profileHobbies).where(eq(profileHobbies.profileId, profileId));
    if (hobbyIds.length > 0) {
      await tx
        .insert(profileHobbies)
        .values(hobbyIds.map((hobbyId) => ({ profileId, hobbyId })));
    }
  });
}

export async function setProfileValues(profileId: string, valueIds: string[]) {
  await db.transaction(async (tx) => {
    await tx.delete(profileValues).where(eq(profileValues.profileId, profileId));
    if (valueIds.length > 0) {
      await tx
        .insert(profileValues)
        .values(valueIds.map((valueId) => ({ profileId, valueId })));
    }
  });
}

export async function getProfileHobbyIds(profileId: string) {
  const rows = await db.query.profileHobbies.findMany({
    where: eq(profileHobbies.profileId, profileId),
  });
  return rows.map((r) => r.hobbyId);
}

export async function getProfileValueIds(profileId: string) {
  const rows = await db.query.profileValues.findMany({
    where: eq(profileValues.profileId, profileId),
  });
  return rows.map((r) => r.valueId);
}
