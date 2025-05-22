
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Trophy,
  Calendar,
  MessageSquare,
  LineChart,
  User,
  Settings,
  Users
} from "lucide-react";

export function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
    },
    {
      href: "/challenges",
      icon: Trophy,
      label: "Challenges",
    },
    {
      href: "/social",
      icon: Users,
      label: "Social",
    },
    {
      href: "/calendar",
      icon: Calendar,
      label: "Events",
    },
    {
      href: "/analytics",
      icon: LineChart,
      label: "Analytics",
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 girls-shadow">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-1 flex-col items-center py-2 px-1",
              isActive(item.href) && "text-primary"
            )}
          >
            <item.icon
              className={cn(
                "h-6 w-6",
                isActive(item.href) ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span 
              className={cn(
                "text-xs mt-1", 
                isActive(item.href) 
                  ? "font-medium text-primary" 
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
