import Link from "next/link";
import { WaterHero } from "@/components/water-hero";
import { Reveal } from "@/components/reveal";

const PILLARS = [
  {
    title: "Hobbies first",
    body: "Start from what you actually spend your weekends on, not a headshot and a height.",
  },
  {
    title: "Values that match",
    body: "Say what you stand for. We surface the people who already live the same way.",
  },
  {
    title: "Conversations, not queues",
    body: "Every match opens with a prompt worth answering, so nobody's stuck typing “hey”.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-black text-white">
      <section className="relative h-screen w-full">
        <WaterHero />
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-teal-500/60">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase">
            Scroll to view the rest
          </span>
          <span className="animate-bounce text-lg leading-none">↓</span>
        </div>
      </section>

      <section className="relative flex min-h-screen flex-col items-center justify-center gap-14 px-6 py-24">
        {/* Soft teal glow so the seam with the hero reads as one continuous surface. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(20,184,166,0.12),transparent_70%)]"
        />

        <div className="relative flex max-w-2xl flex-col items-center gap-5 text-center">
          <Reveal>
            <span className="rounded-full border border-teal-500/30 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.2em] text-teal-400 uppercase">
              Dating, minus the guesswork
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-heading text-4xl font-extrabold text-balance sm:text-5xl">
              Be seen and heard for who you truly are
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-base text-white/60 text-pretty sm:text-lg">
              Peek connects you through the hobbies you love and the values you live by — soul-to-soul,
              not just swipe-to-swipe.
            </p>
          </Reveal>
        </div>

        <div className="relative grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={300 + i * 100}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-colors duration-300 hover:border-teal-500/40 hover:bg-white/[0.06]">
                <h2 className="font-heading text-base font-bold text-teal-400">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={600} className="relative w-full max-w-md">
          <div className="flex flex-col items-center gap-3">
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-teal-500 text-base font-semibold text-black transition-all duration-200 hover:bg-teal-400 active:translate-y-px"
              >
                Sign up
              </Link>
              <Link
                href="/sign-in"
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-white/15 text-base font-semibold text-white transition-all duration-200 hover:border-white/30 hover:bg-white/5 active:translate-y-px"
              >
                Log in
              </Link>
            </div>
            <p className="text-xs text-white/35">Free to join. No swipe quotas, ever.</p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
