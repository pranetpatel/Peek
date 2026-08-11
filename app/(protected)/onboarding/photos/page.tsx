import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProfilePhotos } from "@/lib/db/queries/profiles";
import { getSignedPhotoUrls } from "@/lib/storage";
import { PhotoUploader } from "@/components/profile/PhotoUploader";

export default async function OnboardingPhotosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const photos = await getProfilePhotos(user.id);
  const signedUrls = await getSignedPhotoUrls(photos.map((p) => p.storagePath));

  const initialPhotos = photos.map((p) => ({
    id: p.id,
    url: signedUrls.get(p.storagePath) ?? "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add your photos</h1>
        <p className="text-muted-foreground">Add at least one photo to continue.</p>
      </div>
      <PhotoUploader initialPhotos={initialPhotos} />
    </div>
  );
}
