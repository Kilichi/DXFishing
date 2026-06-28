import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fetchCatchesPage } from "./actions";
import { CatchesView } from "@/components/catches/catches-view";
import type { SpotOption } from "@/components/catches/location-picker";

export const metadata: Metadata = { title: "Capturas · DX Fishing" };

export default async function CatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ spot?: string }>;
}) {
  const { spot } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [initial, spotsRes] = await Promise.all([
    fetchCatchesPage("all", 0, spot),
    supabase
      .from("fishing_spots")
      .select("id, name, latitude, longitude")
      .order("name", { ascending: true }),
  ]);

  const spots = (spotsRes.data ?? []) as SpotOption[];

  return (
    <CatchesView
      userId={user?.id ?? ""}
      spots={spots}
      spotId={spot}
      initial={initial}
    />
  );
}
