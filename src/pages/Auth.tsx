
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, PartyPopper } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      console.log("Auth page - User found:", { user: !!user, profile, isAdmin });
      
      if (isAdmin) {
        console.log("Auth page - Redirecting admin to admin dashboard");
        navigate("/admin", { replace: true });
      } else if (profile && profile.full_name && profile.username) {
        console.log("Auth page - Profile complete, redirecting to home");
        navigate("/", { replace: true });
      } else {
        console.log("Auth page - Profile incomplete, redirecting to setup");
        navigate("/profile-setup", { replace: true });
      }
    }
  }, [user, profile, authLoading, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful:", data);
      toast({ title: "Welcome back!", description: "You've been successfully logged in." });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ 
        title: "Login failed", 
        description: error.message || "Invalid email or password", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      console.log("Attempting signup for:", email);
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password, 
        options: { 
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`
        } 
      });
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("Signup result:", data);
      
      if (data.user && !data.session) {
        toast({ 
          title: "Check your email", 
          description: "We sent a confirmation link to complete your registration." 
        });
      } else if (data.session) {
        toast({ 
          title: "Account created!", 
          description: "Welcome to the Girls Club!" 
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({ 
        title: "Sign up failed", 
        description: error.message || "Failed to create account", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isLogin ? handleLogin : handleSignup;

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div>
          <PartyPopper className="mx-auto h-12 w-auto text-primary" />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{" "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                // Clear form when switching
                setEmail("");
                setPassword("");
                setFullName("");
              }} 
              className="font-medium text-primary hover:text-primary/90 underline"
              type="button"
            >
              {isLogin ? "create a new account" : "sign in to your account"}
            </button>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-foreground font-medium">Full Name</Label>
              <Input 
                id="fullname" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required={!isLogin}
                placeholder="Enter your full name"
                className="text-foreground"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              autoComplete="email"
              placeholder="Enter your email"
              className="text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="Enter your password"
                className="text-foreground pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
            disabled={loading}
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </Button>
        </form>
      </div>
    </div>
  );
}
