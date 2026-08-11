"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { assertMatchMembership, getSharedAttributesForMatch, otherProfileId } from "@/lib/db/queries/matches";
import { createMessage, getMessagesForMatch } from "@/lib/db/queries/messages";
import { buildStarterOptions, type StarterOption } from "@/lib/conversationStarters";

export async function sendMessage(matchId: string, body: string): Promise<{ error: string } | null> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const trimmed = body.trim();
  if (!trimmed) return { error: "Message can't be empty." };

  const match = await assertMatchMembership(matchId, user.id);
  if (!match) return { error: "Match not found." };

  await createMessage(matchId, user.id, trimmed);
  return null;
}

export async function pollMessages(matchId: string, sinceIso: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const match = await assertMatchMembership(matchId, user.id);
  if (!match) return [];

  const rows = await getMessagesForMatch(matchId, { after: new Date(sinceIso) });
  return rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));
}

export async function getStarters(matchId: string): Promise<StarterOption[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const match = await assertMatchMembership(matchId, user.id);
  if (!match) return [];

  const otherId = otherProfileId(match, user.id);
  const shared = await getSharedAttributesForMatch(user.id, otherId);
  return buildStarterOptions(shared);
}
