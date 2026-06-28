import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ?? null;

  return (
    <div className="flex min-h-dvh flex-col bg-secondary">
      <AppHeader email={user.email ?? ""} fullName={fullName} />
      {/* pb deja hueco para la bottom nav fija */}
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
