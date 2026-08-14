import Link from "next/link";
import { isDemoEnabled } from "@/lib/demo/config";

/** Same entry point, styled for the landing page's dark hero. Hidden in production. */
export function LandingDemoLink() {
  if (!isDemoEnabled()) return null;

  return (
    <Link
      href="/demo"
      className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-teal-500/40 text-sm font-medium text-teal-300 transition-all duration-200 hover:border-teal-400/70 hover:bg-teal-500/10 active:translate-y-px"
    >
      <span className="size-1.5 rounded-full bg-teal-400" aria-hidden />
      Demo mode — no sign-up needed
    </Link>
  );
}

/** Entry point into demo mode from the auth screens. Hidden in production. */
export function DemoModeLink() {
  if (!isDemoEnabled()) return null;

  return (
    <div className="mt-6 border-t border-border pt-4 text-center">
      <p className="text-xs text-muted-foreground">
        Just looking around?{" "}
        <Link href="/demo" className="font-medium text-primary underline-offset-4 hover:underline">
          Enter demo mode
        </Link>
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground/70">
        Seeded fake accounts, no sign-up required.
      </p>
    </div>
  );
}
