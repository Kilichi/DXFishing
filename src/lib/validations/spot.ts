import { z } from "zod";

export const createSpotSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Pon un nombre")
    .max(120, "Máximo 120 caracteres"),
  description: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
  fishTypes: z
    .array(z.string().trim().min(1))
    .max(20, "Demasiadas especies"),
  isPublic: z.boolean(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type CreateSpotValues = z.infer<typeof createSpotSchema>;
