
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

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !fullName)) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        console.log("Attempting login for:", email);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You've been successfully logged in." });
      } else {
        console.log("Attempting signup for:", email);
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { 
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/`
          } 
        });
        if (error) throw error;
        if (data.user && !data.session) {
          toast({ title: "Check your email", description: "We sent a confirmation link to complete your registration." });
        } else if (data.session) {
          toast({ title: "Account created!", description: "Welcome to the Girls Club!" });
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const defaultMessage = isLogin ? "Sign in failed" : "Sign up failed";
      toast({ title: defaultMessage, description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <PartyPopper className="mx-auto h-12 w-auto text-primary" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Or{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary hover:text-primary/90">
                {isLogin ? "create a new account" : "sign in to your account"}
              </button>
            </p>
          </div>
          <form onSubmit={handleAuthAction} className="mt-8 space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input id="fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-girls-gradient opacity-80" />
        <img
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1552674605-db6ffd402907?q=80&w=1974&auto=format&fit=crop"
          alt="Women exercising"
        />
      </div>
    </div>
  );
}
