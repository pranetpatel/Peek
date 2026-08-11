import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { assertMatchMembership, otherProfileId } from "@/lib/db/queries/matches";
import { getMessagesForMatch } from "@/lib/db/queries/messages";
import { getProfileById, getProfilePhotos } from "@/lib/db/queries/profiles";
import { getSignedPhotoUrl } from "@/lib/storage";
import { ChatThread } from "@/components/chat/ChatThread";

export default async function MatchThreadPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const match = await assertMatchMembership(matchId, user.id);
  if (!match) notFound();

  const otherId = otherProfileId(match, user.id);
  const [otherProfile, otherPhotos, initialMessages] = await Promise.all([
    getProfileById(otherId),
    getProfilePhotos(otherId),
    getMessagesForMatch(matchId),
  ]);
  if (!otherProfile) notFound();

  const primaryPhoto = otherPhotos[0]?.storagePath;
  const photoUrl = primaryPhoto ? await getSignedPhotoUrl(primaryPhoto) : null;

  return (
    <ChatThread
      matchId={matchId}
      myProfileId={user.id}
      otherDisplayName={otherProfile.displayName}
      otherPhotoUrl={photoUrl}
      initialMessages={initialMessages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
    />
  );
}
