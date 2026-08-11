"use client";

import { useState, useTransition } from "react";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getStarters } from "@/app/(protected)/matches/actions";
import type { StarterCategory, StarterOption } from "@/lib/conversationStarters";

const CATEGORY_LABELS: Record<StarterCategory, string> = {
  connection: "Something you connected on",
  getToKnow: "Get to know each other",
  goDeeper: "Go deeper",
};
const CATEGORY_ORDER: StarterCategory[] = ["connection", "getToKnow", "goDeeper"];

export function StarterDialog({ matchId, onPick }: { matchId: string; onPick: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<StarterOption[] | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && options === null) {
      startTransition(async () => {
        setOptions(await getStarters(matchId));
      });
    }
  }

  function pick(text: string) {
    onPick(text);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" size="icon" />}>
        <SparklesIcon />
        <span className="sr-only">Need a conversation starter?</span>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Need a conversation starter?</DialogTitle>
          <DialogDescription>Pick one — you can edit it before sending.</DialogDescription>
        </DialogHeader>

        {isPending && !options && <p className="text-sm text-muted-foreground">Loading...</p>}

        <div className="space-y-4">
          {CATEGORY_ORDER.map((category) => {
            const items = options?.filter((o) => o.category === category) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={category} className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {CATEGORY_LABELS[category]}
                </p>
                <div className="flex flex-col gap-1.5">
                  {items.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => pick(option.text)}
                      className="rounded-lg border border-border p-2.5 text-left text-sm hover:bg-muted"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
