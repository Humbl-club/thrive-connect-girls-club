
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

  const handleAvatarChange = () => {
    // This would be connected to a file upload function
    console.log("Change avatar clicked");
  };

  const handleBackgroundChange = () => {
    // This would be connected to a file upload function
    console.log("Change background clicked");
  };

  const handleBioEdit = () => {
    // This would open a modal or form to edit bio
    console.log("Edit bio clicked");
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Background Image */}
      <div 
        className={cn(
          "w-full h-40 bg-girls-gradient relative overflow-hidden",
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
        
        {isEditable && isHovering && (
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute bottom-2 right-2 flex items-center gap-1 opacity-90"
            onClick={handleBackgroundChange}
          >
            <Camera size={14} />
            <span className="text-xs">Change Cover</span>
          </Button>
        )}
      </div>
      
      {/* Avatar */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-white girls-shadow">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={username} />
            ) : (
              <AvatarFallback className="bg-muted text-4xl">
                <User size={40} />
              </AvatarFallback>
            )}
          </Avatar>
          
          {isEditable && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full w-8 h-8"
              onClick={handleAvatarChange}
            >
              <Camera size={14} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Username and Bio */}
      <div className="mt-20 text-center px-4">
        <h1 className="text-2xl font-bold">{username}</h1>
        
        <div className="mt-2 relative max-w-md mx-auto">
          <p className="text-muted-foreground text-sm">{bio}</p>
          
          {isEditable && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-8 top-0 h-6 w-6"
              onClick={handleBioEdit}
            >
              <Edit size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
