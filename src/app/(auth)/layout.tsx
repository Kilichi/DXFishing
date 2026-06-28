import { redirect } from "next/navigation";
import { Fish } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="grid min-h-dvh place-items-center bg-secondary px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-float">
            <Fish className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DX Fishing</h1>
            <p className="text-sm text-muted-foreground">
              Tu diario de pesca y mapa de spots
            </p>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
