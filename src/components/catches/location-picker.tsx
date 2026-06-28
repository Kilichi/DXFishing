"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MiniMap = dynamic(() => import("./mini-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />,
});

export interface SpotOption {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface LocationValue {
  lat: number;
  lng: number;
  spotId?: string;
}

type Mode = "geo" | "spot" | "map";

const MODES: { key: Mode; label: string }[] = [
  { key: "geo", label: "Mi ubicación" },
  { key: "spot", label: "Spot" },
  { key: "map", label: "Mapa" },
];

interface LocationPickerProps {
  spots: SpotOption[];
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
}

export function LocationPicker({ spots, value, onChange }: LocationPickerProps) {
  const [mode, setMode] = useState<Mode>("geo");
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocalización no disponible");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        toast.error("No se pudo obtener tu ubicación");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex rounded-2xl bg-secondary p-1">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={cn(
              "flex-1 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
              mode === m.key
                ? "bg-background text-accent shadow-soft"
                : "text-muted-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "geo" && (
        <Button
          type="button"
          variant="outline"
          onClick={useMyLocation}
          disabled={locating}
        >
          {locating ? <Loader2 className="animate-spin" /> : <Crosshair />}
          Usar mi ubicación
        </Button>
      )}

      {mode === "spot" && (
        <Select
          value={value?.spotId ?? ""}
          onValueChange={(id) => {
            const spot = spots.find((s) => s.id === id);
            if (spot?.latitude != null && spot.longitude != null) {
              onChange({
                lat: spot.latitude,
                lng: spot.longitude,
                spotId: spot.id,
              });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Elige un spot" />
          </SelectTrigger>
          <SelectContent>
            {spots.length === 0 ? (
              <SelectItem value="none" disabled>
                No hay spots disponibles
              </SelectItem>
            ) : (
              spots.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}

      {mode === "map" && (
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <MiniMap
            value={value ? { lat: value.lat, lng: value.lng } : null}
            onChange={(lat, lng) => onChange({ lat, lng })}
          />
        </div>
      )}

      {value && (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-primary" />
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-1 font-medium text-destructive hover:underline"
          >
            Quitar
          </button>
        </p>
      )}
    </div>
  );
}
