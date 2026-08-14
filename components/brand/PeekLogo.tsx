import { cn } from "@/lib/utils";

/**
 * Brand mark. The eyes are the literal emoji rather than vector art, so they
 * render in the viewer's own system emoji font — the same glyph the favicon
 * (`app/icon.svg`) shows in their tab.
 */
export function PeekLogo({
  className,
  wordmark = true,
}: {
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <span aria-hidden="true" className="leading-none">
        👀
      </span>
      {wordmark ? <span>Peek</span> : <span className="sr-only">Peek</span>}
    </span>
  );
}
