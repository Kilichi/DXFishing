"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, Map, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/user-menu";

const ITEMS = [
  { href: "/map", label: "Mapa", icon: Map },
  { href: "/catches", label: "Capturas", icon: Fish },
  { href: "/club", label: "Club", icon: Users },
] as const;

interface SideNavProps {
  email: string;
  fullName: string | null;
}

export function SideNav({ email, fullName }: SideNavProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border/60 bg-background/80 px-4 py-6 backdrop-blur-lg md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Fish className="size-5" />
        </span>
        <span className="text-lg font-bold tracking-tight">DX Fishing</span>
      </div>

      <nav className="flex flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-accent"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-2xl bg-secondary/60 px-3 py-2">
        <UserMenu email={email} fullName={fullName} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{fullName || "Pescador"}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
    </aside>
  );
}
