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

    // Fetch the most recent completed fitting to pre-populate data
    const { data: lastFitting } = await supabase
      .from("fitting_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Prepare new session data - copy from last fitting if available
    const newSessionData: any = {
      user_id: user.id,
      status: "in_progress",
      current_step: 1,
    };

    if (lastFitting) {
      // Copy all player profile data
      newSessionData.player_name = lastFitting.player_name;
      newSessionData.player_age = lastFitting.player_age;
      newSessionData.handedness = lastFitting.handedness;
      newSessionData.unit_preference = lastFitting.unit_preference;
      newSessionData.height_ft = lastFitting.height_ft;
      newSessionData.height_in = lastFitting.height_in;
      newSessionData.height_cm = lastFitting.height_cm;
      newSessionData.wrist_to_floor = lastFitting.wrist_to_floor;
      newSessionData.glove_size = lastFitting.glove_size;
      newSessionData.hand_length = lastFitting.hand_length;
      newSessionData.longest_finger = lastFitting.longest_finger;
      newSessionData.has_physical_limitations = lastFitting.has_physical_limitations;
      newSessionData.physical_limitations_text = lastFitting.physical_limitations_text;

      // Copy golf experience data
      newSessionData.golf_experience = lastFitting.golf_experience;
      newSessionData.years_playing = lastFitting.years_playing;
      newSessionData.rounds_per_year = lastFitting.rounds_per_year;
      newSessionData.handicap = lastFitting.handicap;
      newSessionData.typical_score = lastFitting.typical_score;
      newSessionData.practice_frequency = lastFitting.practice_frequency;

      // Copy swing characteristics
      newSessionData.driver_swing_speed = lastFitting.driver_swing_speed;
      newSessionData.driver_carry_distance = lastFitting.driver_carry_distance;
      newSessionData.seven_iron_carry = lastFitting.seven_iron_carry;
      newSessionData.ball_flight = lastFitting.ball_flight;
      newSessionData.shot_shape = lastFitting.shot_shape;
      newSessionData.miss_tendency = lastFitting.miss_tendency;
      newSessionData.tempo = lastFitting.tempo;
      newSessionData.swing_path = lastFitting.swing_path;

      // Copy current equipment
      newSessionData.current_driver_loft = lastFitting.current_driver_loft;
      newSessionData.current_driver_shaft = lastFitting.current_driver_shaft;
      newSessionData.current_driver_length = lastFitting.current_driver_length;
      newSessionData.current_iron_brand = lastFitting.current_iron_brand;
      newSessionData.current_iron_model = lastFitting.current_iron_model;
      newSessionData.current_wedge_lofts = lastFitting.current_wedge_lofts;
      newSessionData.current_putter_style = lastFitting.current_putter_style;
      newSessionData.equipment_age = lastFitting.equipment_age;
      newSessionData.grip_condition = lastFitting.grip_condition;
      newSessionData.club_satisfaction = lastFitting.club_satisfaction;

      // Copy preferences
      newSessionData.priority_clubs = lastFitting.priority_clubs;
      newSessionData.budget_range = lastFitting.budget_range;
      newSessionData.brand_preferences = lastFitting.brand_preferences;
      newSessionData.aesthetic_preference = lastFitting.aesthetic_preference;
      newSessionData.fitting_goals = lastFitting.fitting_goals;

      // Copy wedge data
      newSessionData.wedge_pw_loft = lastFitting.wedge_pw_loft;
      newSessionData.wedge_pw_carry = lastFitting.wedge_pw_carry;
      newSessionData.wedge_gap_distance = lastFitting.wedge_gap_distance;
      newSessionData.wedge_shot_types = lastFitting.wedge_shot_types;
      newSessionData.wedge_turf_interaction = lastFitting.wedge_turf_interaction;
      newSessionData.wedge_bounce_preference = lastFitting.wedge_bounce_preference;
      newSessionData.wedge_grind_preference = lastFitting.wedge_grind_preference;

      // Copy putter data
      newSessionData.putter_stroke_type = lastFitting.putter_stroke_type;
      newSessionData.putter_arc_type = lastFitting.putter_arc_type;
      newSessionData.putter_tempo = lastFitting.putter_tempo;
      newSessionData.putter_miss_tendency = lastFitting.putter_miss_tendency;
      newSessionData.putter_green_speed = lastFitting.putter_green_speed;
      newSessionData.putter_alignment_preference = lastFitting.putter_alignment_preference;
      newSessionData.putter_feel_preference = lastFitting.putter_feel_preference;
      newSessionData.putter_forward_press = lastFitting.putter_forward_press;
      newSessionData.putter_grip_size = lastFitting.putter_grip_size;
      newSessionData.putter_head_style = lastFitting.putter_head_style;
      newSessionData.putter_forgiveness_priority = lastFitting.putter_forgiveness_priority;
      newSessionData.putter_typical_distance = lastFitting.putter_typical_distance;
      newSessionData.putter_sole_flush = lastFitting.putter_sole_flush;
      newSessionData.putter_current_satisfaction = lastFitting.putter_current_satisfaction;

      // Copy golf ball data
      newSessionData.ball_current_brand = lastFitting.ball_current_brand;
      newSessionData.ball_current_model = lastFitting.ball_current_model;
      newSessionData.ball_priority = lastFitting.ball_priority;
      newSessionData.ball_feel_preference = lastFitting.ball_feel_preference;
      newSessionData.ball_spin_preference = lastFitting.ball_spin_preference;
      newSessionData.ball_price_range = lastFitting.ball_price_range;
      newSessionData.ball_durability_importance = lastFitting.ball_durability_importance;
    }

    console.log("User ID:", user.id);
    console.log("Session valid:", !!sessionData.session);
    if (lastFitting) {
      console.log("Pre-populating from last fitting:", lastFitting.id);
    }

    const { data, error } = await supabase
      .from("fitting_sessions")
      .insert(newSessionData)
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
      const message = lastFitting
        ? "Your previous fitting data has been loaded. Update any changes and continue!"
        : "Let's get started with your fitting!";
      
      toast({
        title: "Session created",
        description: message,
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