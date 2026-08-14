"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const OBSERVER = { THRESHOLD: 0.2, ROOT_MARGIN: "0px 0px -10% 0px" };

type RevealProps = {
  children: React.ReactNode;
  /** Stagger, in ms, before this element animates once it enters the viewport. */
  delay?: number;
  className?: string;
};

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: OBSERVER.THRESHOLD, rootMargin: OBSERVER.ROOT_MARGIN },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100 blur-none" : "translate-y-6 opacity-0 blur-[2px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
