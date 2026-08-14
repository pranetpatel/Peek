"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { addProfilePhoto, getProfilePhotos } from "@/lib/db/queries/profiles";
import { uploadPhotoFile } from "@/lib/storage";
import { demoAvatarPath } from "@/lib/demo/config";

const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export type PhotoActionResult = { error: string } | null;

export async function uploadPhoto(formData: FormData): Promise<PhotoActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a photo" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "Photo must be under 5MB" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Please upload an image file" };
  }

  const existing = await getProfilePhotos(user.id);
  if (existing.length >= MAX_PHOTOS) {
    return { error: `You can upload up to ${MAX_PHOTOS} photos` };
  }

  if (user.isDemo) {
    // Demo mode never touches Supabase Storage — record a generated stand-in
    // so the rest of the photo flow (ordering, minimum count) still runs.
    await addProfilePhoto(user.id, demoAvatarPath(`${user.id}-${Date.now()}`), existing.length);
  } else {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    await uploadPhotoFile(path, file);
    await addProfilePhoto(user.id, path, existing.length);
  }

  revalidatePath("/onboarding/photos");
  return null;
}

export async function finishPhotosStep(): Promise<PhotoActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const existing = await getProfilePhotos(user.id);
  if (existing.length === 0) {
    return { error: "Please add at least one photo" };
  }

  redirect("/onboarding/hobbies");
}
