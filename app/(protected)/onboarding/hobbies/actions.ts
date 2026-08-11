"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { setProfileHobbies } from "@/lib/db/queries/profiles";

const MIN_HOBBIES = 5;

export async function saveHobbies(formData: FormData): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const hobbyIds = formData.getAll("hobbyIds").map(String);
  if (hobbyIds.length < MIN_HOBBIES) {
    return { error: `Please select at least ${MIN_HOBBIES} hobbies` };
  }

  await setProfileHobbies(user.id, hobbyIds);
  redirect("/onboarding/values");
}
