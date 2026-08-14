"use server";

import { createClient } from "@/lib/supabase/server";
import { createBareProfile } from "@/lib/db/queries/profiles";
import { redirect } from "next/navigation";
import { clearDemoPersonaCookie, getDemoPersona } from "@/lib/demo/session";

export type AuthActionResult = { error: string } | null;

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  // A real sign-in always wins over a demo session — otherwise getCurrentUser
  // would keep preferring the demo cookie.
  await clearDemoPersonaCookie();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Sign up failed. Please try again." };

  await createBareProfile({
    id: data.user.id,
    displayName: "",
    birthdate: "2000-01-01",
    gender: "",
    interestedIn: [],
  });

  redirect("/onboarding/profile");
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  await clearDemoPersonaCookie();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/browse");
}

export async function signOut() {
  if (await getDemoPersona()) {
    await clearDemoPersonaCookie();
    redirect("/demo");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
