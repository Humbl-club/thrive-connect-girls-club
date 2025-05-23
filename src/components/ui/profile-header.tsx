
import { useState } from "react";
import { User, Camera, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  username: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  bio?: string;
  isEditable?: boolean;
  className?: string;
}

export function ProfileHeader({
  username,
  avatarUrl,
  backgroundUrl,
  bio = "No bio yet",
  isEditable = false,
  className,
}: ProfileHeaderProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Background Image */}
      <div 
        className={cn(
          "w-full h-32 bg-girls-gradient relative overflow-hidden rounded-lg",
          backgroundUrl ? "" : "bg-gradient-to-r from-girls-purple to-girls-pink"
        )}
        onMouseEnter={() => isEditable && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {backgroundUrl && (
          <img 
            src={backgroundUrl} 
            alt="Profile background" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Avatar */}
      <div className="absolute left-4 -bottom-12">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={username} />
          ) : (
            <AvatarFallback className="bg-muted text-2xl">
              <User size={32} />
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      {/* Username and Bio */}
      <div className="mt-16 px-4">
        <h1 className="text-xl font-bold">{username}</h1>
        <p className="text-muted-foreground text-sm mt-1">{bio}</p>
      </div>
    </div>
  );
}
