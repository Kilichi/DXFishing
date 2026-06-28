import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MapView } from "@/components/map/map-view";
import type { SpotWithAuthor } from "@/components/map/types";

export const metadata: Metadata = { title: "Mapa · DX Fishing" };

export default async function MapPage() {
  const supabase = await createClient();

  // RLS devuelve públicos + propios. El autor se embebe vía FK a profiles.
  const { data } = await supabase
    .from("fishing_spots")
    .select(
      "id, name, description, fish_types, is_public, latitude, longitude, user_id, author:profiles(full_name, username)",
    )
    .order("created_at", { ascending: false });

  const spots = (data ?? []) as unknown as SpotWithAuthor[];

  return <MapView spots={spots} />;
}
