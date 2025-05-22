
import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className={cn("flex-1", !isAuthPage && "pb-16")}>
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  );
}
