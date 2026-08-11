import { db } from "@/lib/db";
import { likes } from "@/lib/db/schema";

export async function createLike(likerId: string, likedId: string) {
  await db
    .insert(likes)
    .values({ likerId, likedId })
    .onConflictDoNothing({ target: [likes.likerId, likes.likedId] });
}
