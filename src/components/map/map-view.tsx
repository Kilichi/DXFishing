"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { NewSpotDialog } from "./new-spot-dialog";
import type { SpotWithAuthor } from "./types";

// Leaflet rompe en SSR: se carga solo en cliente.
const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />,
});

interface MapViewProps {
  spots: SpotWithAuthor[];
}

export function MapView({ spots }: MapViewProps) {
  const router = useRouter();
  const [addMode, setAddMode] = useState(false);
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  function handlePick(lat: number, lng: number) {
    setPending({ lat, lng });
    setAddMode(false);
    setDialogOpen(true);
  }

  function toggleAddMode() {
    if (addMode) {
      setAddMode(false);
      return;
    }
    setAddMode(true);
    toast.info("Toca el mapa para situar el punto");
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setPending(null);
  }

  function handleCreated() {
    setDialogOpen(false);
    setPending(null);
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Mapa</h1>
        <span className="text-sm text-muted-foreground">
          {spots.length} {spots.length === 1 ? "punto" : "puntos"}
        </span>
      </div>

      <div className="relative h-[calc(100dvh-11rem)] min-h-[380px] w-full overflow-hidden rounded-2xl border border-border/60 shadow-soft md:h-[calc(100dvh-8rem)]">
        <MapCanvas
          spots={spots}
          addMode={addMode}
          pending={pending}
          onPick={handlePick}
        />

        {addMode && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-[1000] flex justify-center">
            <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-float">
              <MapPin className="size-4" />
              Toca el mapa para situar el punto
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleAddMode}
          aria-label={addMode ? "Cancelar" : "Añadir punto"}
          className="absolute bottom-4 right-4 z-[1000] grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-float transition-transform active:scale-95"
        >
          {addMode ? <X className="size-6" /> : <Plus className="size-6" />}
        </button>
      </div>

      {pending && (
        <NewSpotDialog
          open={dialogOpen}
          onOpenChange={handleDialogChange}
          lat={pending.lat}
          lng={pending.lng}
          onCreated={handleCreated}
        />
      )}
    </section>
  );
}
