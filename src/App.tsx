
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { SettingsProvider } from "@/hooks/use-settings";
import { AnalyticsProvider } from "@/hooks/use-analytics";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileProtectedRoute } from "@/components/auth/ProfileProtectedRoute";

import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Challenges from "./pages/Challenges";
import Feed from "./pages/Feed";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Social from "./pages/Social";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <AnalyticsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile-setup" element={
                    <ProtectedRoute>
                      <ProfileSetup />
                    </ProtectedRoute>
                  } />
                  <Route path="/feed" element={
                    <ProfileProtectedRoute>
                      <Feed />
                    </ProfileProtectedRoute>
                  } />
                  <Route path="/" element={
                    <ProfileProtectedRoute>
                      <Index />
                    </ProfileProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProfileProtectedRoute>
                      <Profile />
                    </ProfileProtectedRoute>
                  } />
                  <Route path="/challenges" element={
                    <ProfileProtectedRoute>
                      <Challenges />
                    </ProfileProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <ProfileProtectedRoute>
                      <Calendar />
                    </ProfileProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProfileProtectedRoute>
                      <Settings />
                    </ProfileProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProfileProtectedRoute>
                      <Analytics />
                    </ProfileProtectedRoute>
                  } />
                  <Route path="/social" element={
                    <ProfileProtectedRoute>
                      <Social />
                    </ProfileProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AnalyticsProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
