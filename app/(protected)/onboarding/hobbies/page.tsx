import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveHobbies } from "@/lib/db/queries/taxonomy";
import { getProfileHobbyIds } from "@/lib/db/queries/profiles";
import { TagPicker, type TagGroup } from "@/components/profile/TagPicker";
import { saveHobbies } from "./actions";

export default async function OnboardingHobbiesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [hobbies, selectedIds] = await Promise.all([
    getActiveHobbies(),
    getProfileHobbyIds(user.id),
  ]);

  const groups: TagGroup[] = [];
  const byCategory = new Map<string, TagGroup["items"]>();
  for (const hobby of hobbies) {
    const items = byCategory.get(hobby.category) ?? [];
    items.push({ id: hobby.id, label: hobby.label });
    byCategory.set(hobby.category, items);
  }
  for (const [category, items] of byCategory) {
    groups.push({ category, items });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">What do you love doing?</h1>
        <p className="text-muted-foreground">Pick at least 5 hobbies — like building a taste profile.</p>
      </div>
      <TagPicker
        groups={groups}
        fieldName="hobbyIds"
        initialSelectedIds={selectedIds}
        minRequired={5}
        action={saveHobbies}
      />
    </div>
  );
}
