"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createSpot } from "@/app/(app)/map/actions";
import { SPECIES } from "@/lib/constants/fish";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface NewSpotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lat: number;
  lng: number;
  onCreated: () => void;
}

interface FormFields {
  name: string;
  description: string;
  isPublic: boolean;
}

export function NewSpotDialog({
  open,
  onOpenChange,
  lat,
  lng,
  onCreated,
}: NewSpotDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [species, setSpecies] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: { name: "", description: "", isPublic: true },
  });

  // Reinicia el formulario cada vez que se abre para un punto nuevo.
  useEffect(() => {
    if (open) {
      reset({ name: "", description: "", isPublic: true });
      setSpecies([]);
      setCustom("");
    }
  }, [open, reset]);

  const isPublic = watch("isPublic");

  function toggleSpecies(value: string) {
    setSpecies((prev) =>
      prev.includes(value)
        ? prev.filter((s) => s !== value)
        : [...prev, value],
    );
  }

  function addCustom() {
    const value = custom.trim();
    if (!value) return;
    if (!species.includes(value)) setSpecies((prev) => [...prev, value]);
    setCustom("");
  }

  function onSubmit(fields: FormFields) {
    startTransition(async () => {
      const result = await createSpot({
        name: fields.name,
        description: fields.description || undefined,
        fishTypes: species,
        isPublic: fields.isPublic,
        lat,
        lng,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Punto guardado");
      onCreated();
    });
  }

  const customInSpecies = species.filter(
    (s) => !SPECIES.includes(s as (typeof SPECIES)[number]),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo punto de pesca</DialogTitle>
          <DialogDescription>
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="spot-name">Nombre</Label>
            <Input
              id="spot-name"
              placeholder="Ej. Cola del embalse"
              {...register("name", { required: true, maxLength: 120 })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">Pon un nombre.</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="spot-desc">Descripción</Label>
            <Textarea
              id="spot-desc"
              placeholder="Accesos, mejor época, técnica…"
              {...register("description", { maxLength: 500 })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Especies</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIES.map((s) => {
                const active = species.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecies(s)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-accent hover:bg-secondary/70",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {customInSpecies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customInSpecies.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => toggleSpecies(s)}
                      aria-label={`Quitar ${s}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Otra especie…"
              />
              <Button type="button" variant="outline" size="icon" onClick={addCustom}>
                <Plus />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
            <div>
              <p className="text-sm font-medium">Punto público</p>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? "Visible para toda la comunidad"
                  : "Solo visible para ti"}
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={(v) => setValue("isPublic", v)}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            Guardar punto
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
