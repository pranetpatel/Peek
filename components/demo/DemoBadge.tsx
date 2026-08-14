import Link from "next/link";
import { isDemoEnabled } from "@/lib/demo/config";
import { getDemoPersona } from "@/lib/demo/session";
import { exitDemo } from "@/app/demo/actions";

/**
 * Persistent reminder that the current session is fake, rendered app-wide from
 * the root layout. Renders nothing (and reads no cookies) when demo mode is off.
 */
export async function DemoBadge() {
  if (!isDemoEnabled()) return null;

  const persona = await getDemoPersona();
  if (!persona) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs shadow-lg backdrop-blur">
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      <span className="font-medium">
        Demo: {persona.displayName || "new account"}
      </span>
      <Link href="/demo" className="text-muted-foreground underline-offset-4 hover:underline">
        panel
      </Link>
      <form action={exitDemo}>
        <button type="submit" className="text-muted-foreground underline-offset-4 hover:underline">
          exit
        </button>
      </form>
    </div>
  );
}
