import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NewFitting() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [existingSession, setExistingSession] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const checkExistingSession = async () => {
      const { data, error } = await supabase
        .from("fitting_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error checking session:", error);
      } else if (data) {
        const daysSinceCreated = Math.floor(
          (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        setExistingSession({ ...data, daysSinceCreated });
      }

      setIsLoading(false);
    };

    checkExistingSession();
  }, [user]);

  const handleResumeSession = () => {
    if (existingSession) {
      router.push(`/fitting/${existingSession.id}/step/${existingSession.current_step}`);
    }
  };

  const handleNewSession = async () => {
    if (!user) return;

    setIsLoading(true);

    // Verify session is valid before attempting insert
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error("Session validation error:", sessionError);
      toast({
        title: "Session Error",
        description: "Your session expired. Please log in again.",
        variant: "destructive",
      });
      setIsLoading(false);
      router.push("/auth/login");
      return;
    }

    console.log("User ID:", user.id);
    console.log("Session valid:", !!sessionData.session);

    const { data, error } = await supabase
      .from("fitting_sessions")
      .insert({
        user_id: user.id,
        status: "in_progress",
        current_step: 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Fitting session creation error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: `Failed to create fitting session: ${error.message}`,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Session created",
        description: "Let's get started with your fitting!",
      });
      router.push(`/fitting/${data.id}/step/1`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : existingSession ? (
            <Card className="w-full max-w-2xl">
              <CardHeader className="px-4 sm:px-6 pt-6 pb-4">
                <CardTitle className="text-xl sm:text-2xl">Resume Your Fitting?</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  You have an unfinished fitting session from{" "}
                  {new Date(existingSession.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
                {existingSession.daysSinceCreated > 7 && (
                  <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm sm:text-base">Session is over 7 days old</AlertTitle>
                    <AlertDescription className="text-sm">
                      Recommendations may need updating. Consider starting a new fitting for the most accurate results.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button onClick={handleResumeSession} className="flex-1 h-11 text-base">
                    Resume (Step {existingSession.current_step} of 6)
                  </Button>
                  <Button onClick={handleNewSession} variant="outline" className="flex-1 h-11 text-base">
                    Start New Fitting
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-2xl">
              <CardHeader className="px-4 sm:px-6 pt-6 pb-4">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl">Start Your Club Fitting</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Get a complete full-bag recommendation in about 8-10 minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6">
                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">What You'll Need:</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Basic measurements (height, wrist-to-floor) — we'll show you how to measure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Your current equipment details (optional but helpful)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Approximate swing speeds and carry distances (estimates are fine)</span>
                      </li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-6">What You'll Get:</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Personalized specs for driver, woods, hybrids, irons, wedges, and putter</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Recommended shaft flex, length, lie angle, and grip size</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Plain-English explanations for every recommendation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Top matching products from leading brands</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Downloadable PDF report you can take to any fitter</span>
                      </li>
                    </ul>
                  </div>

                  <Button onClick={handleNewSession} size="lg" className="w-full h-12 text-base sm:text-lg">
                    Start 8-Section Fitting
                  </Button>
                  
                  <p className="text-xs sm:text-sm text-center text-muted-foreground">
                    Your progress auto-saves at every step. You can exit and resume anytime.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}