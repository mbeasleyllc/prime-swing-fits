import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Set up listener BEFORE login to catch the SIGNED_IN event
    let redirectTimeout: NodeJS.Timeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Session is confirmed established, safe to redirect
        subscription.unsubscribe();
        clearTimeout(redirectTimeout);
        
        // Small delay to ensure cookie is written
        await new Promise(resolve => setTimeout(resolve, 300));
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        
        window.location.href = "/dashboard";
      }
    });

    // Now perform the login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      subscription.unsubscribe();
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      // Fallback timeout in case SIGNED_IN event doesn't fire within 5 seconds
      redirectTimeout = setTimeout(() => {
        subscription.unsubscribe();
        window.location.href = "/dashboard";
      }, 5000);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 px-4 sm:px-6 pt-6 pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold">Sign in</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Enter your credentials to access your Prime Swing Fits account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 text-base"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-base"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Google
            </Button>

            <div className="text-center text-sm space-y-2 pt-2">
              <Link href="/auth/reset" className="block text-muted-foreground hover:text-foreground py-2">
                Forgot your password?
              </Link>
              <div className="py-2">
                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}