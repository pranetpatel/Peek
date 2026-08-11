import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { and, asc, eq, gt } from "drizzle-orm";

export async function getMessagesForMatch(matchId: string, opts?: { after?: Date }) {
  return db.query.messages.findMany({
    where: opts?.after
      ? and(eq(messages.matchId, matchId), gt(messages.createdAt, opts.after))
      : eq(messages.matchId, matchId),
    orderBy: [asc(messages.createdAt)],
  });
}

export async function createMessage(matchId: string, senderId: string, body: string) {
  const [message] = await db.insert(messages).values({ matchId, senderId, body }).returning();
  return message;
}
