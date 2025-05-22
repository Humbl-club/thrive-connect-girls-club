
import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ProfileMenu } from "./ProfileMenu";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isAuthPage && (
        <header className="border-b border-border px-4 py-3 flex justify-end">
          <ProfileMenu />
        </header>
      )}
      <main className={cn("flex-1", !isAuthPage && "pb-16")}>
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  );
}
