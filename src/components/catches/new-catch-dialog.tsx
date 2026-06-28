"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createCatch } from "@/app/(app)/catches/actions";
import { SPECIES } from "@/lib/constants/fish";
import { uploadCatchPhoto } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  LocationPicker,
  type LocationValue,
  type SpotOption,
} from "./location-picker";

const OTHER = "__other__";

function localNow(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

interface NewCatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  spots: SpotOption[];
  onCreated: () => void;
}

export function NewCatchDialog({
  open,
  onOpenChange,
  userId,
  spots,
  onCreated,
}: NewCatchDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [speciesSel, setSpeciesSel] = useState("");
  const [speciesOther, setSpeciesOther] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [notes, setNotes] = useState("");
  const [caughtAt, setCaughtAt] = useState(localNow);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSpeciesSel("");
      setSpeciesOther("");
      setWeight("");
      setLength("");
      setNotes("");
      setCaughtAt(localNow());
      setLocation(null);
      setFile(null);
      setPreview(null);
    }
  }, [open]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const busy = isPending || uploading;

  function submit() {
    const species = speciesSel === OTHER ? speciesOther.trim() : speciesSel;
    if (!species) {
      toast.error("Elige una especie");
      return;
    }

    startTransition(async () => {
      let photoUrl: string | undefined;
      if (file) {
        try {
          setUploading(true);
          photoUrl = await uploadCatchPhoto(file, userId);
        } catch {
          setUploading(false);
          toast.error("No se pudo subir la foto");
          return;
        }
        setUploading(false);
      }

      const result = await createCatch({
        species,
        weightKg: weight ? Number(weight) : undefined,
        lengthCm: length ? Number(length) : undefined,
        photoUrl,
        spotId: location?.spotId,
        lat: location?.lat,
        lng: location?.lng,
        notes: notes || undefined,
        caughtAt: new Date(caughtAt).toISOString(),
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Captura registrada");
      onCreated();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva captura</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary text-muted-foreground transition-colors hover:border-primary"
          >
            {preview ? (
              <Image
                src={preview}
                alt="Vista previa"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm">
                <Camera className="size-7" />
                Añadir foto
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <div className="flex flex-col gap-1.5">
            <Label>Especie</Label>
            <Select value={speciesSel} onValueChange={setSpeciesSel}>
              <SelectTrigger>
                <SelectValue placeholder="Elige una especie" />
              </SelectTrigger>
              <SelectContent>
                {SPECIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
                <SelectItem value={OTHER}>Otra…</SelectItem>
              </SelectContent>
            </Select>
            {speciesSel === OTHER && (
              <Input
                placeholder="Nombre de la especie"
                value={speciesOther}
                onChange={(e) => setSpeciesOther(e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="length">Talla (cm)</Label>
              <Input
                id="length"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                placeholder="0"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Ubicación</Label>
            <LocationPicker
              spots={spots}
              value={location}
              onChange={setLocation}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caught-at">Fecha y hora</Label>
            <Input
              id="caught-at"
              type="datetime-local"
              value={caughtAt}
              max={localNow()}
              onChange={(e) => setCaughtAt(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Cebo, condiciones, técnica…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button onClick={submit} disabled={busy} className="w-full">
            {busy ? <Loader2 className="animate-spin" /> : <Plus />}
            {uploading ? "Subiendo foto…" : "Guardar captura"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
