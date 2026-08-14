import { NextResponse } from "next/server";
import { isDemoEnabled } from "@/lib/demo/config";

/**
 * Deterministic placeholder "photo" for demo profiles. Generating them here
 * keeps demo mode free of Supabase Storage and of any external image host —
 * the seeded photo rows just point at /demo/avatar?seed=...
 */
export async function GET(request: Request) {
  if (!isDemoEnabled()) return new NextResponse("Not found", { status: 404 });

  const seed = new URL(request.url).searchParams.get("seed") ?? "peek";

  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const hue = hash % 360;
  const hueTwo = (hue + 40 + (hash % 60)) % 360;
  const initial = (seed.trim()[0] ?? "?").toUpperCase();
  const angle = hash % 90;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="hsl(${hue} 70% 55%)"/>
      <stop offset="100%" stop-color="hsl(${hueTwo} 65% 30%)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#g)"/>
  <circle cx="${120 + (hash % 160)}" cy="${140 + (hash % 120)}" r="${60 + (hash % 70)}" fill="hsl(${hueTwo} 80% 75%)" fill-opacity="0.25"/>
  <text x="200" y="250" text-anchor="middle" dominant-baseline="central"
    font-family="system-ui, sans-serif" font-size="180" font-weight="700"
    fill="#fff" fill-opacity="0.85">${initial}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
