import { cookies } from "next/headers";
import { DEMO_COOKIE, isDemoEnabled } from "./config";
import { getPersona, demoProfileId, type DemoPersona } from "./data";

/** The persona the current request is signed in as, or null when not in demo mode. */
export async function getDemoPersona(): Promise<DemoPersona | null> {
  if (!isDemoEnabled()) return null;
  const cookieStore = await cookies();
  const key = cookieStore.get(DEMO_COOKIE)?.value;
  if (!key) return null;
  return getPersona(key) ?? null;
}

export async function getDemoUserId(): Promise<string | null> {
  const persona = await getDemoPersona();
  return persona ? demoProfileId(persona.key) : null;
}

export async function setDemoPersonaCookie(key: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearDemoPersonaCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}
