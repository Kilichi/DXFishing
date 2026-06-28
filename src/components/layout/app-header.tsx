import { Fish } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";

interface AppHeaderProps {
  email: string;
  fullName: string | null;
}

export function AppHeader({ email, fullName }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Fish className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">DX Fishing</span>
        </div>
        <UserMenu email={email} fullName={fullName} />
      </div>
    </header>
  );
}
