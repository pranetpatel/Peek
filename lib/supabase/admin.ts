import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key. All photo storage access
// (upload during onboarding, signed URL generation on browse) goes through
// this trusted server-side client rather than per-user Storage RLS policies —
// the same simplification applied to Postgres access in lib/db.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
