"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProfileById } from "@/lib/db/queries/profiles";
import { getBrowseBatch, type BrowseCard } from "@/lib/db/queries/browse";
import { getSignedPhotoUrls } from "@/lib/storage";
import { createLike } from "@/lib/db/queries/likes";
import { createMatchIfMutual } from "@/lib/db/queries/matches";

export type BrowseCardWithPhoto = BrowseCard & { photoUrl: string | null };

export async function getNextBrowseBatch(excludeIds: string[]): Promise<BrowseCardWithPhoto[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const profile = await getProfileById(user.id);
  if (!profile || !profile.onboardingCompletedAt) redirect("/onboarding/profile");

  const cards = await getBrowseBatch({
    currentProfileId: user.id,
    interestedIn: profile.interestedIn,
    excludeIds,
  });

  const paths = cards.map((c) => c.primaryPhotoPath).filter((p): p is string => Boolean(p));
  const signedUrls = await getSignedPhotoUrls(paths);

  return cards.map((c) => ({
    ...c,
    photoUrl: c.primaryPhotoPath ? signedUrls.get(c.primaryPhotoPath) ?? null : null,
  }));
}

export async function likeProfile(likedProfileId: string): Promise<{ matched: boolean; matchId?: string }> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  await createLike(user.id, likedProfileId);
  const match = await createMatchIfMutual(user.id, likedProfileId);

  return match ? { matched: true, matchId: match.id } : { matched: false };
}
