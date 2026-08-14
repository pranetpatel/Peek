import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProfileById } from "@/lib/db/queries/profiles";
import { getNextBrowseBatch } from "./actions";
import { BrowseDeck } from "@/components/profile/BrowseDeck";
import { PeekLogo } from "@/components/brand/PeekLogo";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export default async function BrowsePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const profile = await getProfileById(user.id);
  if (!profile || !profile.onboardingCompletedAt) redirect("/onboarding/profile");

  const initialCards = await getNextBrowseBatch([]);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto flex w-full max-w-sm items-center justify-between pb-6">
        <h1 className="text-lg">
          <PeekLogo />
        </h1>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>
      <BrowseDeck initialCards={initialCards} />
    </div>
  );
}
