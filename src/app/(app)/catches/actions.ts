"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createCatchSchema, type CatchTab } from "@/lib/validations/catch";
import {
  CATCHES_PAGE_SIZE,
  type CatchWithAuthor,
} from "@/components/catches/types";

const SELECT =
  "id, species, weight_kg, length_cm, photo_url, latitude, longitude, notes, caught_at, user_id, spot_id, author:profiles(full_name, username)";

export type CreateResult = { error: string } | { success: true };

export async function createCatch(values: unknown): Promise<CreateResult> {
  const parsed = createCatchSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos de la captura." };

  const v = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Necesitas iniciar sesión." };

  const { error } = await supabase.from("catches").insert({
    user_id: user.id,
    species: v.species,
    weight_kg: v.weightKg ?? null,
    length_cm: v.lengthCm ?? null,
    photo_url: v.photoUrl ?? null,
    spot_id: v.spotId ?? null,
    notes: v.notes || null,
    caught_at: v.caughtAt,
    location:
      v.lat != null && v.lng != null
        ? `SRID=4326;POINT(${v.lng} ${v.lat})`
        : null,
  });
  if (error) return { error: "No se pudo guardar la captura. Inténtalo de nuevo." };

  revalidatePath("/catches");
  return { success: true };
}

export interface CatchesPage {
  items: CatchWithAuthor[];
  nextPage: number | null;
}

export async function fetchCatchesPage(
  tab: CatchTab,
  page: number,
  spotId?: string,
): Promise<CatchesPage> {
  const supabase = await createClient();
  const from = page * CATCHES_PAGE_SIZE;
  const to = from + CATCHES_PAGE_SIZE - 1;

  let query = supabase
    .from("catches")
    .select(SELECT)
    .order("caught_at", { ascending: false })
    .range(from, to);

  if (spotId) query = query.eq("spot_id", spotId);

  if (tab === "mine") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { items: [], nextPage: null };
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;
  if (error || !data) return { items: [], nextPage: null };

  const items = data as unknown as CatchWithAuthor[];
  const nextPage = items.length === CATCHES_PAGE_SIZE ? page + 1 : null;
  return { items, nextPage };
}
