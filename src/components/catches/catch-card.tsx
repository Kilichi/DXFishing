import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Fish, MapPin, Ruler, Weight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CatchWithAuthor } from "./types";

function authorName(c: CatchWithAuthor): string {
  return c.author?.full_name || c.author?.username || "Anónimo";
}

export function CatchCard({ item }: { item: CatchWithAuthor }) {
  const hasCoords = item.latitude != null && item.longitude != null;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-secondary">
        {item.photo_url ? (
          <Image
            src={item.photo_url}
            alt={item.species}
            fill
            sizes="(max-width: 768px) 100vw, 28rem"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <Fish className="size-10" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-sm font-semibold text-accent shadow-soft backdrop-blur">
          {item.species}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {item.weight_kg != null && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Weight className="size-4 text-primary" />
              {item.weight_kg} kg
            </span>
          )}
          {item.length_cm != null && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Ruler className="size-4 text-primary" />
              {item.length_cm} cm
            </span>
          )}
        </div>

        {item.notes && (
          <p className="text-sm text-muted-foreground">{item.notes}</p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {authorName(item)} ·{" "}
            {format(new Date(item.caught_at), "d MMM yyyy", { locale: es })}
          </span>
          {hasCoords && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {item.latitude!.toFixed(3)}, {item.longitude!.toFixed(3)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
