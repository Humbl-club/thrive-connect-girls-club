
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { Check, Moon, Paintbrush, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

const predefinedColors = [
  { primary: "#8A2BE2", secondary: "#FF69B4" }, // Purple & Pink (Default)
  { primary: "#20B2AA", secondary: "#FFD700" }, // Teal & Gold
  { primary: "#FF6347", secondary: "#4169E1" }, // Tomato & Royal Blue
  { primary: "#00CED1", secondary: "#FF1493" }, // Dark Turquoise & Deep Pink
  { primary: "#FF8C00", secondary: "#9932CC" }, // Dark Orange & Dark Orchid
  { primary: "#2E8B57", secondary: "#FF4500" }, // Sea Green & Orange Red
];

export function ThemeCustomizer() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [primaryColor, setPrimaryColor] = useState(settings.themePrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.themeSecondaryColor);

  const applyColors = async () => {
    try {
      document.documentElement.style.setProperty("--primary", primaryColor);
      document.documentElement.style.setProperty("--secondary", secondaryColor);
      
      await updateSettings({
        themePrimaryColor: primaryColor,
        themeSecondaryColor: secondaryColor,
      });
      
      toast({
        description: "Theme colors updated",
      });
    } catch (error) {
      toast({
        title: "Error saving theme",
        description: "Failed to apply theme changes",
        variant: "destructive",
      });
    }
  };

  const applyPreset = async (preset: { primary: string; secondary: string }) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    
    document.documentElement.style.setProperty("--primary", preset.primary);
    document.documentElement.style.setProperty("--secondary", preset.secondary);
    
    await updateSettings({
      themePrimaryColor: preset.primary,
      themeSecondaryColor: preset.secondary,
    });
    
    toast({
      description: "Theme preset applied",
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">Toggle theme customizer</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium">Appearance</h4>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-start",
                theme !== "dark" && "border-2 border-primary"
              )}
              onClick={() => toggleTheme()}
              disabled={theme !== "dark"}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
              {theme !== "dark" && <Check className="ml-auto h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-start",
                theme === "dark" && "border-2 border-primary"
              )}
              onClick={() => toggleTheme()}
              disabled={theme === "dark"}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
              {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Colors</h4>
            
            <div className="grid grid-cols-3 gap-2">
              {predefinedColors.map((preset, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full h-8 p-0 border-2"
                  style={{
                    borderColor:
                      preset.primary === settings.themePrimaryColor &&
                      preset.secondary === settings.themeSecondaryColor
                        ? preset.primary
                        : "transparent",
                  }}
                  onClick={() => applyPreset(preset)}
                >
                  <div className="flex w-full h-full">
                    <div
                      className="w-1/2 h-full rounded-l-sm"
                      style={{ background: preset.primary }}
                    />
                    <div
                      className="w-1/2 h-full rounded-r-sm"
                      style={{ background: preset.secondary }}
                    />
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs">Primary Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-8 w-10 p-0 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs">Secondary Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-8 w-10 p-0 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
            
            <Button className="w-full" size="sm" onClick={applyColors}>
              Apply Custom Colors
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
