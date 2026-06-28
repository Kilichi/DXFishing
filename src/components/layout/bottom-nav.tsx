"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, Map, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/map", label: "Mapa", icon: Map },
  { href: "/catches", label: "Capturas", icon: Fish },
  { href: "/club", label: "Club", icon: Users },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/85 backdrop-blur-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center rounded-xl px-4 py-1 transition-colors",
                    active && "bg-secondary",
                  )}
                >
                  <Icon className={cn("size-5", active && "fill-primary/15")} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
