"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TagGroup = {
  category: string;
  items: { id: string; label: string; description?: string | null }[];
};

type TagPickerActionResult = { error: string } | null;

export function TagPicker({
  groups,
  fieldName,
  initialSelectedIds,
  minRequired,
  action,
  nextLabel = "Continue",
}: {
  groups: TagGroup[];
  fieldName: string;
  initialSelectedIds: string[];
  minRequired: number;
  action: (formData: FormData) => Promise<TagPickerActionResult>;
  nextLabel?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelectedIds));
  const [state, formAction, pending] = useActionState<TagPickerActionResult, FormData>(
    (_prev, formData) => action(formData),
    null
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {groups.map((group) => (
        <div key={group.category || "default"} className="space-y-2">
          {group.category && <h3 className="text-sm font-medium text-muted-foreground">{group.category}</h3>}
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => {
              const isSelected = selected.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.description ?? undefined}
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-transparent hover:bg-accent"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {[...selected].map((id) => (
        <input key={id} type="hidden" name={fieldName} value={id} />
      ))}

      <p className="text-sm text-muted-foreground">
        {selected.size} selected (minimum {minRequired})
      </p>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={pending || selected.size < minRequired}>
        {pending ? "Saving..." : nextLabel}
      </Button>
    </form>
  );
}
