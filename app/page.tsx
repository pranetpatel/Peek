import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold">Peek</h1>
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
    </div>
  );
}
