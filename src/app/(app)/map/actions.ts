"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createSpotSchema } from "@/lib/validations/spot";

export type ActionResult = { error: string } | { success: true };

export async function createSpot(values: unknown): Promise<ActionResult> {
  const parsed = createSpotSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del punto." };

  const { name, description, fishTypes, isPublic, lat, lng } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Necesitas iniciar sesión." };

  const { error } = await supabase.from("fishing_spots").insert({
    user_id: user.id,
    name,
    description: description || null,
    fish_types: fishTypes,
    is_public: isPublic,
    // EWKT: PostGIS lo castea a geography(Point,4326). Orden: lng lat.
    location: `SRID=4326;POINT(${lng} ${lat})`,
  });
  if (error) return { error: "No se pudo guardar el punto. Inténtalo de nuevo." };

  revalidatePath("/map");
  return { success: true };
}
