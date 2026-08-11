import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "profile-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function uploadPhotoFile(path: string, file: File) {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
  });
  if (error) throw error;
}

export async function getSignedPhotoUrls(paths: string[]): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;

  const map = new Map<string, string>();
  for (const item of data) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }
  return map;
}

export async function getSignedPhotoUrl(path: string): Promise<string | null> {
  const map = await getSignedPhotoUrls([path]);
  return map.get(path) ?? null;
}
