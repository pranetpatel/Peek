import Link from "next/link";
import { isDemoEnabled } from "@/lib/demo/config";

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
