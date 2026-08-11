"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage, pollMessages } from "@/app/(protected)/matches/actions";
import { StarterDialog } from "@/components/chat/StarterDialog";

const POLL_INTERVAL_MS = 3000;

type Message = { id: string; matchId: string; senderId: string; body: string; createdAt: string };

export function ChatThread({
  matchId,
  myProfileId,
  otherDisplayName,
  otherPhotoUrl,
  initialMessages,
}: {
  matchId: string;
  myProfileId: string;
  otherDisplayName: string;
  otherPhotoUrl: string | null;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (document.visibilityState !== "visible") return;
      const last = messagesRef.current[messagesRef.current.length - 1];
      const since = last ? last.createdAt : new Date(0).toISOString();
      const fresh = await pollMessages(matchId, since);
      if (cancelled || fresh.length === 0) return;
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const toAdd = fresh.filter((m) => !existingIds.has(m.id));
        return toAdd.length ? [...prev, ...toAdd] : prev;
      });
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const body = draft.trim();
    if (!body || isSending) return;
    setIsSending(true);
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      matchId,
      senderId: myProfileId,
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    const result = await sendMessage(matchId, body);
    if (result?.error) {
      toast.error(result.error);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
    setIsSending(false);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col px-4 py-6">
      <div className="flex items-center gap-3 pb-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/matches")}>
          <ArrowLeftIcon />
        </Button>
        <Avatar>
          {otherPhotoUrl && <AvatarImage src={otherPhotoUrl} alt={otherDisplayName} />}
          <AvatarFallback>{otherDisplayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="font-medium">{otherDisplayName}</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
              message.senderId === myProfileId ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {message.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 pt-4">
        <StarterDialog matchId={matchId} onPick={setDraft} />
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="min-h-9 flex-1 resize-none"
          rows={1}
        />
        <Button onClick={handleSend} disabled={isSending || !draft.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
