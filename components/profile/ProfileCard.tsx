import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { BrowseCardWithPhoto } from "@/app/(protected)/browse/actions";

export function ProfileCard({ card }: { card: BrowseCardWithPhoto }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/5] w-full bg-muted">
        {card.photoUrl ? (
          <Image src={card.photoUrl} alt={card.displayName} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No photo</div>
        )}
        <Badge className="absolute right-3 top-3" variant="secondary">
          {card.compatibilityPercent}% compatible
        </Badge>
      </div>
      <CardContent className="space-y-3 pt-4">
        <h2 className="text-xl font-semibold">
          {card.displayName}, {card.age}
        </h2>
        {card.promptSnippet && (
          <p className="text-sm">
            <span className="text-muted-foreground">{card.promptSnippet.question} </span>
            {card.promptSnippet.answer}
          </p>
        )}
        {!card.promptSnippet && card.bio && <p className="text-sm text-muted-foreground">{card.bio}</p>}

        {(card.sharedHobbies.length > 0 || card.sharedValues.length > 0) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {card.sharedHobbies.map((label) => (
              <Badge key={`h-${label}`} variant="outline">
                {label}
              </Badge>
            ))}
            {card.sharedValues.map((label) => (
              <Badge key={`v-${label}`} variant="outline" className="border-primary text-primary">
                {label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
