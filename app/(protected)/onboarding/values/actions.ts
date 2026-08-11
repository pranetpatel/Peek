"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { setProfileValues, completeOnboarding } from "@/lib/db/queries/profiles";

const MIN_VALUES = 3;

export async function saveValues(formData: FormData): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const valueIds = formData.getAll("valueIds").map(String);
  if (valueIds.length < MIN_VALUES) {
    return { error: `Please select at least ${MIN_VALUES} values` };
  }

  await setProfileValues(user.id, valueIds);
  await completeOnboarding(user.id);
  redirect("/browse");
}
