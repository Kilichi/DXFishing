import type { Metadata } from "next";
import { Medal, Trophy, Users } from "lucide-react";

export const metadata: Metadata = { title: "Club · DX Fishing" };

const TEASERS = [
  { icon: Trophy, label: "Torneos" },
  { icon: Medal, label: "Rankings" },
  { icon: Users, label: "Comunidad" },
] as const;

export default function ClubPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Club</h1>

      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary to-accent px-6 py-12 text-center text-primary-foreground shadow-soft">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-white/15 backdrop-blur">
          <Users className="size-8" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
          Próximamente
        </p>
        <h2 className="mt-1 text-2xl font-bold">El club llega pronto</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-white/85">
          Compite con otros pescadores, sube en el ranking y comparte tus
          mejores jornadas.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {TEASERS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background py-5 text-muted-foreground"
          >
            <Icon className="size-6 text-primary" />
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
