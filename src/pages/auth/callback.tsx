import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from URL (Supabase sends tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // Also check query params (some flows use query params)
        const { code, error: authError, error_description } = router.query;

        if (authError) {
          setError(error_description as string || "Authentication error occurred");
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        // Handle code-based flow (email confirmation)
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            code as string
          );

          if (exchangeError) {
            setError(exchangeError.message);
            setTimeout(() => router.push("/auth/login"), 3000);
            return;
          }

          if (data?.session) {
            // Check if user profile exists
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("user_id")
              .eq("user_id", data.session.user.id)
              .maybeSingle();

            // Redirect to dashboard
            router.push("/dashboard");
            return;
          }
        }

        // Handle token-based flow (magic link, OAuth)
        if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setError(sessionError.message);
            setTimeout(() => router.push("/auth/login"), 3000);
            return;
          }

          if (data?.session) {
            router.push("/dashboard");
            return;
          }
        }

        // If we get here and have a type parameter, handle specific types
        if (type === "signup") {
          router.push("/dashboard");
          return;
        }

        // Default: check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          router.push("/dashboard");
        } else {
          setError("No authentication session found");
          setTimeout(() => router.push("/auth/login"), 3000);
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "An unexpected error occurred");
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    // Only run after router is ready
    if (router.isReady) {
      handleAuthCallback();
    }
  }, [router, router.isReady]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600 font-semibold">Authentication Error</div>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            <p className="text-xs text-muted-foreground">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
            <div className="text-lg font-semibold">Verifying your account...</div>
            <p className="text-sm text-muted-foreground">Please wait while we complete the verification process</p>
          </>
        )}
      </div>
    </div>
  );
}