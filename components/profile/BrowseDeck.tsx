"use client";

import { useState, useTransition } from "react";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Button } from "@/components/ui/button";
import { getNextBrowseBatch, type BrowseCardWithPhoto } from "@/app/(protected)/browse/actions";

const REFILL_THRESHOLD = 2;

export function BrowseDeck({ initialCards }: { initialCards: BrowseCardWithPhoto[] }) {
  const [queue, setQueue] = useState(initialCards);
  const [seenIds, setSeenIds] = useState<string[]>(initialCards.map((c) => c.id));
  const [exhausted, setExhausted] = useState(initialCards.length === 0);
  const [isPending, startTransition] = useTransition();

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
      <Button onClick={skip} variant="outline" className="w-full" disabled={isPending}>
        Next
      </Button>
    </div>
  );
}
