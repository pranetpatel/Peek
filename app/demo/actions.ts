"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isDemoEnabled } from "@/lib/demo/config";
import { getPersona } from "@/lib/demo/data";
import { clearDemoPersonaCookie, getDemoPersona, setDemoPersonaCookie } from "@/lib/demo/session";
import { ensureDemoData, resetDemoData } from "@/lib/demo/seed";

function assertEnabled() {
  if (!isDemoEnabled()) throw new Error("Demo mode is disabled");
}

export async function enterDemo(formData: FormData) {
  assertEnabled();

  const key = String(formData.get("persona") ?? "");
  const persona = getPersona(key);
  if (!persona) throw new Error(`Unknown demo persona: ${key}`);

  await ensureDemoData();
  await setDemoPersonaCookie(persona.key);

  redirect(persona.onboarded ? "/browse" : "/onboarding/profile");
}

export async function exitDemo() {
  await clearDemoPersonaCookie();
  redirect("/demo");
}

/** Wipes and re-seeds every demo row, then keeps you signed in as the same persona. */
export async function resetDemo() {
  assertEnabled();
  await resetDemoData();
  revalidatePath("/", "layout");
  redirect("/demo?reset=1");
}

/** Reset + drop back to the launcher signed out of the demo persona. */
export async function resetDemoAndExit() {
  assertEnabled();
  await resetDemoData();
  await clearDemoPersonaCookie();
  revalidatePath("/", "layout");
  redirect("/demo?reset=1");
}

export async function getCurrentDemoPersonaKey() {
  const persona = await getDemoPersona();
  return persona?.key ?? null;
}
