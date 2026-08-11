"use client";

import { useActionState } from "react";
import { saveBasicInfo, type ProfileFormResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GENDER_OPTIONS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "nonbinary", label: "Nonbinary" },
];

export default function OnboardingProfilePage() {
  const [state, formAction, pending] = useActionState<ProfileFormResult, FormData>(
    (_prev, formData) => saveBasicInfo(formData),
    null
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tell us about you</h1>
        <p className="text-muted-foreground">This is the foundation of your profile.</p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="displayName">Name</Label>
          <Input id="displayName" name="displayName" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthdate">Birthdate</Label>
          <Input id="birthdate" name="birthdate" type="date" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">I am a</Label>
          <Select name="gender">
            <SelectTrigger id="gender" className="w-full">
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Interested in</Label>
          <div className="flex flex-wrap gap-4">
            {GENDER_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <Checkbox name="interestedIn" value={option.value} />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationText">Location</Label>
          <Input id="locationText" name="locationText" placeholder="City, State" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" rows={4} placeholder="What should people know about you?" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promptAnswer">What makes you feel most alive?</Label>
          <Textarea id="promptAnswer" name="promptAnswer" rows={3} required />
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
