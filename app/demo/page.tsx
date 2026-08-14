import Link from "next/link";
import { notFound } from "next/navigation";
import { isDemoEnabled } from "@/lib/demo/config";
import { PERSONAS, CAST, demoProfileId } from "@/lib/demo/data";
import { getDemoPersona } from "@/lib/demo/session";
import { getDemoDataStatus } from "@/lib/demo/seed";
import { enterDemo, exitDemo, resetDemo, resetDemoAndExit } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

const FEATURE_CHECKS = [
  { label: "Onboarding — profile, photos, hobbies, values", href: "/onboarding/profile" },
  { label: "Browse deck — ranking, skip, like, refill", href: "/browse" },
  { label: "Matches list — photos, last message, empty state", href: "/matches" },
  { label: "Chat — send, poll, conversation starters", href: "/matches" },
];

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  if (!isDemoEnabled()) notFound();

  const { reset } = await searchParams;
  const active = await getDemoPersona();
  const status = await getDemoDataStatus();

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Demo mode</h1>
            <Badge variant="secondary">development only</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in as a seeded fake account to exercise every feature without creating a real
            Supabase user. All data lives in your Postgres database under fixed{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">de300000-…</code> ids, so it&apos;s
            safe to reset at any time.
          </p>
          {reset && (
            <p className="text-sm text-primary">Demo data was reset to its scripted starting state.</p>
          )}
        </header>

        {active && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Signed in as {active.displayName || "a brand-new account"}
              </CardTitle>
              <CardDescription>
                Profile id <code className="text-xs">{demoProfileId(active.key)}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" render={<Link href={active.onboarded ? "/browse" : "/onboarding/profile"} />}>
                Continue
              </Button>
              <Button size="sm" variant="outline" render={<Link href="/matches" />}>
                Matches
              </Button>
              <form action={exitDemo}>
                <Button type="submit" size="sm" variant="ghost">
                  Exit demo
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Pick an account</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {PERSONAS.map((persona) => (
              <Card key={persona.key} className="flex flex-col">
                <CardHeader className="flex-1">
                  <CardTitle className="text-base">
                    {persona.displayName || "Fresh account"}
                  </CardTitle>
                  <CardDescription>{persona.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={enterDemo}>
                    <input type="hidden" name="persona" value={persona.key} />
                    <Button
                      type="submit"
                      className="w-full"
                      variant={active?.key === persona.key ? "outline" : "default"}
                      size="sm"
                    >
                      {active?.key === persona.key ? "Restart as this account" : "Enter as this account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">What to test</h2>
          <ul className="space-y-2 text-sm">
            {FEATURE_CHECKS.map((check) => (
              <li key={check.label} className="flex items-center justify-between gap-4">
                <span>{check.label}</span>
                <Link href={check.href} className="shrink-0 text-primary underline-offset-4 hover:underline">
                  open
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            As Ava, four cast members have already liked you — liking Theo, Jordan, Nina or Sam back
            fires the instant-match toast. Maya, Priya and Elena are pre-matched, with Elena&apos;s
            thread left empty so you can test conversation starters.
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Seeded data</h2>
          <p className="text-sm text-muted-foreground">
            {status.seededProfiles} of {status.expectedProfiles} demo profiles present —{" "}
            {PERSONAS.length} playable personas and {CAST.length} browse-queue profiles, each with
            generated photos, hobbies and values.
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={resetDemo}>
              <Button type="submit" size="sm" variant="outline">
                Reset demo data
              </Button>
            </form>
            <form action={resetDemoAndExit}>
              <Button type="submit" size="sm" variant="ghost">
                Reset and sign out
              </Button>
            </form>
          </div>
          <p className="text-xs text-muted-foreground">
            Reset deletes every like, match and message involving a demo profile and re-seeds the
            scripted starting state. Real accounts are untouched.
          </p>
        </section>
      </div>
    </div>
  );
}
