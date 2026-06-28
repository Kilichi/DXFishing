"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// Toaster con la identidad visual de DX Fishing (paleta sky).
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-border/60 bg-card text-card-foreground shadow-float",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground rounded-xl",
          cancelButton: "bg-secondary text-secondary-foreground rounded-xl",
          error: "text-destructive",
        },
      }}
      {...props}
    />
  );
}
