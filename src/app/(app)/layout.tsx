import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const email = user.email ?? "";
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ?? null;

  return (
    <div className="min-h-dvh bg-secondary md:flex">
      <SideNav email={email} fullName={fullName} />

      <div className="flex min-h-dvh flex-1 flex-col">
        <div className="md:hidden">
          <AppHeader email={email} fullName={fullName} />
        </div>
        <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4 md:max-w-4xl md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
