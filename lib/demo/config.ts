// Shared by client and server components — must not import anything server-only.

export const DEMO_COOKIE = "peek_demo_persona";

/**
 * Demo mode is a development affordance: it hands out a signed-out "session"
 * backed by seeded fake profiles, bypassing Supabase auth entirely.
 *
 * On by default anywhere that isn't the live site — `next dev`, and Vercel
 * preview/branch deployments. The production domain stays off unless
 * NEXT_PUBLIC_ENABLE_DEMO=true is set explicitly, since turning it on there
 * hands every visitor a working account without signing up.
 */
export function isDemoEnabled() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO === "true") return true;
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO === "false") return false;

  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv) return vercelEnv !== "production";

  return process.env.NODE_ENV !== "production";
}

/** Same-origin generated avatar, so demo mode never needs Supabase Storage. */
export function demoAvatarPath(seed: string) {
  return `/demo/avatar?seed=${encodeURIComponent(seed)}`;
}

/** Photo storage paths that are already URLs/paths rather than Storage keys. */
export function isDirectPhotoPath(path: string) {
  return path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://");
}
