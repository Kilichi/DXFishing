import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Deduplica getUser dentro de un mismo render (layout + page comparten la
// misma llamada en lugar de pegar al Auth server varias veces por navegación).
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
