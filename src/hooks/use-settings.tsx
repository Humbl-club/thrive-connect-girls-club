
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserSettings {
  dailyStepGoal: number;
  weeklyStepGoal: number;
  unitSystem: "imperial" | "metric";
  notificationsEnabled: boolean;
  privacyLevel: "public" | "friends" | "private";
  themePrimaryColor: string;
  themeSecondaryColor: string;
}

const defaultSettings: UserSettings = {
  dailyStepGoal: 10000,
  weeklyStepGoal: 70000,
  unitSystem: "imperial",
  notificationsEnabled: true,
  privacyLevel: "public",
  themePrimaryColor: "#8A2BE2", // Default purple
  themeSecondaryColor: "#FF69B4", // Default pink
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      
      // Try to get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // If authenticated, try to get user settings from database
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('settings')
            .eq('user_id', session.user.id)
            .single();
            
          if (error) throw error;
          
          if (data?.settings) {
            setSettings({ ...defaultSettings, ...data.settings });
          }
        } catch (error) {
          console.error("Error loading user settings:", error);
          
          // Fall back to local storage
          const savedSettings = localStorage.getItem("user_settings");
          if (savedSettings) {
            try {
              setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
            } catch (e) {
              console.error("Error parsing saved settings:", e);
            }
          }
        }
      } else {
        // Not authenticated, use local storage
        const savedSettings = localStorage.getItem("user_settings");
        if (savedSettings) {
          try {
            setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
          } catch (e) {
            console.error("Error parsing saved settings:", e);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Store in local storage for guests or as backup
    localStorage.setItem("user_settings", JSON.stringify(updatedSettings));
    
    // Try to get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // If authenticated, store in database
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: session.user.id,
            settings: updatedSettings,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
          
        if (error) throw error;
      } catch (error) {
        console.error("Error saving user settings:", error);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
