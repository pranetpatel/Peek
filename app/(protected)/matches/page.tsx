import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getMatchesForProfile } from "@/lib/db/queries/matches";
import { getSignedPhotoUrls } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default async function MatchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const matches = await getMatchesForProfile(user.id);
  const paths = matches.map((m) => m.otherPrimaryPhotoPath).filter((p): p is string => Boolean(p));
  const signedUrls = await getSignedPhotoUrls(paths);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-sm space-y-4">
        <h1 className="text-lg font-semibold">Matches</h1>

        {matches.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No matches yet — like someone in{" "}
            <Link href="/browse" className="text-primary underline-offset-4 hover:underline">
              browse
            </Link>{" "}
            to get started.
          </p>
        )}

        {matches.map((match) => {
          const photoUrl = match.otherPrimaryPhotoPath ? signedUrls.get(match.otherPrimaryPhotoPath) : undefined;
          return (
            <Link key={match.id} href={`/matches/${match.id}`}>
              <Card className="flex-row items-center gap-3 px-4">
                <Avatar size="lg">
                  {photoUrl && <AvatarImage src={photoUrl} alt={match.otherDisplayName} />}
                  <AvatarFallback>{match.otherDisplayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardContent className="flex-1 px-0">
                  <p className="font-medium">{match.otherDisplayName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {match.lastMessageBody ?? "Say hi!"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
