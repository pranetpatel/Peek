import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WaterHero } from "@/components/water-hero";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative h-screen w-full">
        <WaterHero />
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-teal-500/60">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase">
            Scroll to view the rest
          </span>
          <span className="animate-bounce text-lg leading-none">↓</span>
        </div>
      </section>

      <section className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-extrabold">Peek</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Be seen and heard for who you truly are. Connect through the hobbies you love and the
            values you live by — soul-to-soul, not just swipe-to-swipe.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/sign-up" className={cn(buttonVariants())}>
            Get started
          </Link>
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline" }))}>
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
