import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveValues } from "@/lib/db/queries/taxonomy";
import { getProfileValueIds } from "@/lib/db/queries/profiles";
import { TagPicker, type TagGroup } from "@/components/profile/TagPicker";
import { saveValues } from "./actions";

export default async function OnboardingValuesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [values, selectedIds] = await Promise.all([
    getActiveValues(),
    getProfileValueIds(user.id),
  ]);

  const groups: TagGroup[] = [
    {
      category: "",
      items: values.map((v) => ({ id: v.id, label: v.label, description: v.description })),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">What matters to you?</h1>
        <p className="text-muted-foreground">Pick at least 3 values you care about most.</p>
      </div>
      <TagPicker
        groups={groups}
        fieldName="valueIds"
        initialSelectedIds={selectedIds}
        minRequired={3}
        action={saveValues}
        nextLabel="Finish"
      />
    </div>
  );
}
