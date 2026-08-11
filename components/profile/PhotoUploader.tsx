"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import { uploadPhoto, finishPhotosStep, type PhotoActionResult } from "@/app/(protected)/onboarding/photos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PhotoUploader({ initialPhotos }: { initialPhotos: { id: string; url: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  const [uploadState, uploadAction, uploadPending] = useActionState<PhotoActionResult, FormData>(
    async (_prev, formData) => {
      const result = await uploadPhoto(formData);
      formRef.current?.reset();
      return result;
    },
    null
  );

  const [continueState, continueAction, continuePending] = useActionState<PhotoActionResult, FormData>(
    () => finishPhotosStep(),
    null
  );

  return (
    <div className="space-y-6">
      {initialPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {initialPhotos.map((photo) => (
            <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {photo.url && (
                <Image src={photo.url} alt="" fill className="object-cover" unoptimized />
              )}
            </div>
          ))}
        </div>
      )}

      <form ref={formRef} action={uploadAction} className="space-y-2">
        <Input name="photo" type="file" accept="image/*" required />
        {uploadState?.error && <p className="text-sm text-destructive">{uploadState.error}</p>}
        <Button type="submit" variant="secondary" className="w-full" disabled={uploadPending}>
          {uploadPending ? "Uploading..." : "Add photo"}
        </Button>
      </form>

      <form action={continueAction}>
        {continueState?.error && <p className="mb-2 text-sm text-destructive">{continueState.error}</p>}
        <Button type="submit" className="w-full" disabled={continuePending}>
          {continuePending ? "Continuing..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
