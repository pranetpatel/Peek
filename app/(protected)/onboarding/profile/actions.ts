"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { updateProfileBasicInfo } from "@/lib/db/queries/profiles";

const schema = z.object({
  displayName: z.string().trim().min(1, "Please enter your name"),
  birthdate: z
    .string()
    .refine((val) => {
      const age = (Date.now() - new Date(val).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 18;
    }, "You must be 18 or older to use Peek"),
  gender: z.string().min(1, "Please select an option"),
  interestedIn: z.array(z.string()).min(1, "Please select at least one option"),
  bio: z.string().trim().max(500).optional(),
  locationText: z.string().trim().max(100).optional(),
  promptAnswer: z.string().trim().min(1, "Please answer at least one prompt"),
});

export type ProfileFormResult = { error: string } | null;

export async function saveBasicInfo(formData: FormData): Promise<ProfileFormResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = schema.safeParse({
    displayName: formData.get("displayName"),
    birthdate: formData.get("birthdate"),
    gender: formData.get("gender"),
    interestedIn: formData.getAll("interestedIn"),
    bio: formData.get("bio") || undefined,
    locationText: formData.get("locationText") || undefined,
    promptAnswer: formData.get("promptAnswer"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your answers" };
  }

  const { promptAnswer, ...rest } = parsed.data;

  await updateProfileBasicInfo(user.id, {
    ...rest,
    prompts: [{ question: "What makes you feel most alive?", answer: promptAnswer }],
  });

  redirect("/onboarding/photos");
}
