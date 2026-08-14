import { createAdminClient } from "@/lib/supabase/admin";
import { isDirectPhotoPath } from "@/lib/demo/config";

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
  // Demo profiles store a ready-to-use path (see lib/demo/config) rather than a
  // Storage object key, so they never touch Supabase.
  const map = new Map<string, string>();
  const storageKeys: string[] = [];
  for (const path of paths) {
    if (isDirectPhotoPath(path)) map.set(path, path);
    else storageKeys.push(path);
  }
  if (storageKeys.length === 0) return map;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(storageKeys, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;

  for (const item of data) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }
  return map;
}

export async function getSignedPhotoUrl(path: string): Promise<string | null> {
  const map = await getSignedPhotoUrls([path]);
  return map.get(path) ?? null;
}
