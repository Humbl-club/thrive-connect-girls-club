import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Instagram } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (authLoading) {
      console.log("Auth page: Still loading auth state...");
      return;
    }

    if (user) {
      console.log("Auth page: User is authenticated, checking profile...", { 
        hasUser: !!user, 
        hasProfile: !!profile,
        profileComplete: profile && profile.full_name && profile.username && profile.instagram_handle
      });
      
      // Give a small delay to ensure profile is loaded
      const timer = setTimeout(() => {
        if (profile && profile.full_name && profile.username && profile.instagram_handle) {
          console.log("Auth page: Profile complete, redirecting to feed");
          navigate("/feed", { replace: true });
        } else {
          console.log("Auth page: Profile incomplete, redirecting to setup");
          navigate("/profile-setup", { replace: true });
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      console.log("Auth page: No user found, staying on auth page");
    }
  }, [user, profile, authLoading, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !instagramHandle) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("Starting sign up process...");
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            instagram_handle: instagramHandle,
          },
        },
      });
      
      if (error) {
        console.error("Sign up error:", error);
        throw error;
      }
      
      console.log("Sign up response:", data);
      
      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link. Please check your email and click the link to complete your registration.",
        });
      } else if (data.session) {
        toast({
          title: "Account created!",
          description: "Welcome to the fitness app!",
        });
        // The auth state change will handle navigation
      }
      
    } catch (error: any) {
      console.error("Sign up error:", error);
      let errorMessage = "An error occurred during sign up";
      
      if (error.message.includes("already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes("password")) {
        errorMessage = "Password must be at least 6 characters long";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("Starting sign in process...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }
      
      console.log("Sign in successful:", data);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      
      // The auth state change will handle navigation
      
    } catch (error: any) {
      console.error("Sign in error:", error);
      let errorMessage = "An error occurred during sign in";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account before signing in.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If user is authenticated, don't show the form (redirect will happen)
  if (user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Fitness App</h1>
          <p className="text-muted-foreground mt-2">
            Track your fitness goals and connect with others
          </p>
        </div>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input 
                  id="email-login"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-login">Password</Label>
                <div className="relative">
                  <Input 
                    id="password-login"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input 
                  id="fullname"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram-handle">Instagram Handle *</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="instagram-handle"
                    placeholder="@johndoe"
                    className="pl-10"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email *</Label>
                <Input 
                  id="email-signup"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password *</Label>
                <div className="relative">
                  <Input 
                    id="password-signup"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link to="#" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="#" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
