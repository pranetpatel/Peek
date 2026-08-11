import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/auth/session";
import { OnboardingProgress } from "@/components/profile/OnboardingProgress";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentUserAndProfile();

  if (profile?.onboardingCompletedAt) {
    redirect("/browse");
  }

  return (
    <div className="min-h-screen px-4 pb-16">
      <OnboardingProgress />
      <div className="mx-auto w-full max-w-md pt-8">{children}</div>
    </div>
  );
}
