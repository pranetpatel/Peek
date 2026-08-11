"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Button } from "@/components/ui/button";
import {
  getNextBrowseBatch,
  likeProfile,
  type BrowseCardWithPhoto,
} from "@/app/(protected)/browse/actions";

const REFILL_THRESHOLD = 2;

export function BrowseDeck({ initialCards }: { initialCards: BrowseCardWithPhoto[] }) {
  const router = useRouter();
  const [queue, setQueue] = useState(initialCards);
  const [seenIds, setSeenIds] = useState<string[]>(initialCards.map((c) => c.id));
  const [exhausted, setExhausted] = useState(initialCards.length === 0);
  const [isPending, startTransition] = useTransition();
  const [isLiking, setIsLiking] = useState(false);

  function maybeRefill(nextSeenIds: string[], remaining: BrowseCardWithPhoto[]) {
    if (remaining.length > REFILL_THRESHOLD || exhausted) return;
    startTransition(async () => {
      const more = await getNextBrowseBatch(nextSeenIds);
      if (more.length === 0) {
        setExhausted(true);
        return;
      }
      setSeenIds((prev) => [...prev, ...more.map((c) => c.id)]);
      setQueue((prev) => [...prev, ...more]);
    });
  }

  function skip() {
    setQueue((prev) => {
      const [, ...rest] = prev;
      maybeRefill(seenIds, rest);
      return rest;
    });
  }

  async function like(likedProfileId: string) {
    setIsLiking(true);
    try {
      const result = await likeProfile(likedProfileId);
      if (result.matched && result.matchId) {
        toast.success("It's a match!", {
          description: "You can both see this in your matches now.",
          action: {
            label: "Say hi",
            onClick: () => router.push(`/matches/${result.matchId}`),
          },
        });
      }
    } finally {
      setIsLiking(false);
      skip();
    }
  }

  if (queue.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-medium">No more profiles right now</p>
        <p className="text-sm text-muted-foreground">Check back later for new people to meet.</p>
      </div>
    );
  }

  const current = queue[0];

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <ProfileCard card={current} />
      <div className="flex gap-2">
        <Button onClick={skip} variant="outline" className="flex-1" disabled={isPending || isLiking}>
          Skip
        </Button>
        <Button
          onClick={() => like(current.id)}
          className="flex-1"
          disabled={isPending || isLiking}
        >
          Like
        </Button>
      </div>
    </div>
  );
}
