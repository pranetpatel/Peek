"use client";

import { usePathname } from "next/navigation";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { path: "/onboarding/profile", label: "About you" },
  { path: "/onboarding/photos", label: "Photos" },
  { path: "/onboarding/hobbies", label: "Hobbies" },
  { path: "/onboarding/values", label: "Values" },
];

export function OnboardingProgress() {
  const pathname = usePathname();
  const currentIndex = Math.max(0, STEPS.findIndex((step) => step.path === pathname));
  const percent = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="mx-auto w-full max-w-md space-y-2 pt-8">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{STEPS[currentIndex]?.label}</span>
        <span>
          Step {currentIndex + 1} of {STEPS.length}
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
