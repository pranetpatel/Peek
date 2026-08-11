import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/db/queries/profiles";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserAndProfile() {
  const user = await getCurrentUser();
  if (!user) return { user: null, profile: null };
  const profile = await getProfileById(user.id);
  return { user, profile };
}
