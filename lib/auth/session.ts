import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/db/queries/profiles";
import { getDemoPersona } from "@/lib/demo/session";
import { demoProfileId } from "@/lib/demo/data";

/**
 * The subset of the auth user the app actually needs. Keeping it narrow lets
 * demo mode hand back a synthetic user without faking a whole Supabase `User`.
 */
export type SessionUser = {
  id: string;
  email: string | null;
  isDemo: boolean;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  // Demo mode short-circuits Supabase entirely — the demo cookie names a
  // seeded profile and that profile id is the session.
  const persona = await getDemoPersona();
  if (persona) {
    return {
      id: demoProfileId(persona.key),
      email: `${persona.key}@demo.peek.local`,
      isDemo: true,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return { id: user.id, email: user.email ?? null, isDemo: false };
}

export async function getCurrentUserAndProfile() {
  const user = await getCurrentUser();
  if (!user) return { user: null, profile: null };
  const profile = await getProfileById(user.id);
  return { user, profile };
}
