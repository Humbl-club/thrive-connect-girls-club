
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Trophy, 
  Users, 
  Calendar,
  User
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  return (
    <NavLink 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center flex-1 py-2",
        "transition-all duration-300 ease-in-out",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-secondary"
      )}
    >
      <div className="relative">
        {icon}
        {isActive && (
          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
        )}
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </NavLink>
  );
};

export function BottomNav() {
  const [activeTab, setActiveTab] = useState('/');
  
  return (
    <div className="fixed inset-x-0 bottom-0 h-16 bg-white border-t border-border flex items-center justify-between px-2 girls-shadow z-50">
      <NavItem 
        to="/" 
        icon={<Home size={20} strokeWidth={2} />} 
        label="Home" 
        isActive={activeTab === '/'} 
      />
      <NavItem 
        to="/challenges" 
        icon={<Trophy size={20} strokeWidth={2} />} 
        label="Challenges" 
        isActive={activeTab === '/challenges'} 
      />
      <NavItem 
        to="/feed" 
        icon={<Users size={20} strokeWidth={2} />} 
        label="Feed" 
        isActive={activeTab === '/feed'} 
      />
      <NavItem 
        to="/calendar" 
        icon={<Calendar size={20} strokeWidth={2} />} 
        label="Events" 
        isActive={activeTab === '/calendar'} 
      />
      <NavItem 
        to="/profile" 
        icon={<User size={20} strokeWidth={2} />} 
        label="Profile" 
        isActive={activeTab === '/profile'} 
      />
    </div>
  );
}
