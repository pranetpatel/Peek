// Shared by client and server components — must not import anything server-only.

export const DEMO_COOKIE = "peek_demo_persona";

/**
 * Demo mode is a development affordance: it hands out a signed-out "session"
 * backed by seeded fake profiles, bypassing Supabase auth entirely. It is on
 * in dev by default and stays off in production unless explicitly opted in.
 */
export function isDemoEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_DEMO === "true";
}

/** Same-origin generated avatar, so demo mode never needs Supabase Storage. */
export function demoAvatarPath(seed: string) {
  return `/demo/avatar?seed=${encodeURIComponent(seed)}`;
}

/** Photo storage paths that are already URLs/paths rather than Storage keys. */
export function isDirectPhotoPath(path: string) {
  return path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://");
}
