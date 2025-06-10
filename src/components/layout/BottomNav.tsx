
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Trophy,
  Calendar,
  Users,
  BarChart2,
  Shield,
} from "lucide-react";
import { useAdmin } from "@/components/auth/AuthProvider";

export function BottomNav() {
  const location = useLocation();
  const isAdmin = useAdmin();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/challenges", icon: Trophy, label: "Challenges" },
    { href: "/social", icon: Users, label: "Social" },
    { href: "/calendar", icon: Calendar, label: "Events" },
    { href: "/analytics", icon: BarChart2, label: "Stats" },
    ...(isAdmin ? [{ href: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-full p-2 shadow-lg">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300",
              location.pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
