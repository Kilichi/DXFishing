import { z } from "zod";

export const createCatchSchema = z
  .object({
    species: z
      .string()
      .trim()
      .min(1, "Elige una especie")
      .max(80, "Máximo 80 caracteres"),
    weightKg: z
      .number()
      .positive("Debe ser mayor que 0")
      .max(1000, "Valor demasiado alto")
      .optional(),
    lengthCm: z
      .number()
      .positive("Debe ser mayor que 0")
      .max(1000, "Valor demasiado alto")
      .optional(),
    photoUrl: z.string().url().optional(),
    spotId: z.string().uuid().optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    notes: z.string().trim().max(1000, "Máximo 1000 caracteres").optional(),
    caughtAt: z.string().datetime({ offset: true }),
  })
  // lat y lng van siempre juntas o ninguna.
  .refine((v) => (v.lat == null) === (v.lng == null), {
    message: "Ubicación incompleta",
    path: ["lat"],
  });

export type CreateCatchValues = z.infer<typeof createCatchSchema>;

export const CATCH_TABS = ["all", "mine"] as const;
export type CatchTab = (typeof CATCH_TABS)[number];
