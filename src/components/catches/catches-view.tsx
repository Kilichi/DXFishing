"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Fish, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  fetchCatchesPage,
  type CatchesPage,
} from "@/app/(app)/catches/actions";
import type { CatchTab } from "@/lib/validations/catch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CatchCard } from "./catch-card";
import { NewCatchDialog } from "./new-catch-dialog";
import type { SpotOption } from "./location-picker";
import type { CatchWithAuthor } from "./types";

interface CatchesViewProps {
  userId: string;
  spots: SpotOption[];
  spotId?: string;
  initial: CatchesPage;
}

export function CatchesView({
  userId,
  spots,
  spotId,
  initial,
}: CatchesViewProps) {
  const [tab, setTab] = useState<CatchTab>("all");
  const [items, setItems] = useState<CatchWithAuthor[]>(initial.items);
  const [nextPage, setNextPage] = useState<number | null>(initial.nextPage);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const reload = useCallback(
    async (t: CatchTab) => {
      setRefreshing(true);
      const page = await fetchCatchesPage(t, 0, spotId);
      setItems(page.items);
      setNextPage(page.nextPage);
      setRefreshing(false);
    },
    [spotId],
  );

  function onTabChange(value: string) {
    const t = value as CatchTab;
    setTab(t);
    void reload(t);
  }

  const loadMore = useCallback(async () => {
    if (nextPage == null || loadingMore) return;
    setLoadingMore(true);
    const page = await fetchCatchesPage(tab, nextPage, spotId);
    setItems((prev) => [...prev, ...page.items]);
    setNextPage(page.nextPage);
    setLoadingMore(false);
  }, [tab, nextPage, spotId, loadingMore]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  function handleCreated() {
    setDialogOpen(false);
    toast.success("¡Buena pieza!");
    void reload(tab);
  }

  const empty = !refreshing && items.length === 0;

  return (
    <section className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Capturas</h1>
        <Tabs value={tab} onValueChange={onTabChange}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="mine">Mías</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {spotId && (
        <p className="rounded-2xl bg-secondary px-4 py-2 text-sm text-accent">
          Mostrando capturas de un spot concreto.
        </p>
      )}

      {refreshing ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : empty ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-background py-16 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Fish className="size-8" />
            <p className="text-sm">
              {tab === "mine"
                ? "Aún no has registrado capturas."
                : "Todavía no hay capturas."}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <CatchCard key={item.id} item={item} />
            ))}
            {loadingMore && <Skeleton className="h-72 w-full" />}
          </div>
          <div ref={sentinel} className="h-1" />
        </div>
      )}

      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        aria-label="Nueva captura"
        className="fixed bottom-24 right-5 z-40 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-float transition-transform active:scale-95 md:bottom-8 md:right-8"
      >
        <Plus className="size-6" />
      </button>

      <NewCatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={userId}
        spots={spots}
        onCreated={handleCreated}
      />
    </section>
  );
}
