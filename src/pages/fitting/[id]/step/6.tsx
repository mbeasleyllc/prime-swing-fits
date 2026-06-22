import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Edit, Check } from "lucide-react";

export default function Step6() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (!id || !user) return;

    const loadAllData = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;

      const [playerRes, swingRes, courseRes, physicalRes, equipmentRes] = await Promise.all([
        supabase.from("player_profile").select("*").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle(),
        supabase.from("swing_profile").select("*").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle(),
        supabase.from("course_conditions").select("*").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle(),
        supabase.from("physical_profile").select("*").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle(),
        supabase.from("current_equipment").select("*").eq("session_id", sessionId).eq("user_id", user.id).maybeSingle(),
      ]);

      setSessionData({
        player: playerRes.data,
        swing: swingRes.data,
        course: courseRes.data,
        physical: physicalRes.data,
        equipment: equipmentRes.data,
      });

      setIsLoading(false);
    };

    loadAllData();
  }, [id, user]);

  const handleEditStep = (step: number) => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/${step}`);
  };

  const handleGenerateRecommendations = async () => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recommendations");
      }

      const { error: sessionError } = await supabase
        .from("fitting_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (sessionError) {
        console.error("Failed to update session:", sessionError);
      }

      toast({
        title: "Recommendations generated!",
        description: "Redirecting to your results...",
      });

      setTimeout(() => {
        router.push(`/fitting/${sessionId}/results`);
      }, 1000);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!sessionData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p>Error loading session data</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
          <ProgressBar currentStep={6} totalSteps={6} />

          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Review your information before generating recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Player Profile */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5 text-accent" />
                    Player Profile
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => handleEditStep(1)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {sessionData.player?.full_name}</div>
                  <div><span className="text-muted-foreground">Age:</span> {sessionData.player?.age}</div>
                  <div><span className="text-muted-foreground">Dominant Hand:</span> {sessionData.player?.dominant_hand}</div>
                  <div><span className="text-muted-foreground">Experience:</span> {sessionData.player?.experience}</div>
                  <div><span className="text-muted-foreground">Handicap:</span> {sessionData.player?.handicap}</div>
                  <div><span className="text-muted-foreground">Primary Goal:</span> {sessionData.player?.primary_goal?.replace("_", " ")}</div>
                </div>
              </div>

              <Separator />

              {/* Swing Profile */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5 text-accent" />
                    Swing Profile
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => handleEditStep(2)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Shot Shape:</span> {sessionData.swing?.typical_shot}</div>
                  <div><span className="text-muted-foreground">Miss Tendency:</span> {sessionData.swing?.miss_tendency}</div>
                  <div><span className="text-muted-foreground">Ball Flight:</span> {sessionData.swing?.ball_flight}</div>
                  <div><span className="text-muted-foreground">Tempo:</span> {sessionData.swing?.swing_tempo}</div>
                  <div><span className="text-muted-foreground">Strength:</span> {sessionData.swing?.swing_strength}</div>
                </div>
              </div>

              <Separator />

              {/* Course Conditions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5 text-accent" />
                    Course Conditions
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => handleEditStep(3)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Turf Type:</span> {sessionData.course?.turf_type}</div>
                  <div><span className="text-muted-foreground">Weather:</span> {sessionData.course?.typical_weather}</div>
                  <div><span className="text-muted-foreground">Ball Used:</span> {sessionData.course?.ball_used}</div>
                </div>
              </div>

              <Separator />

              {/* Physical Profile */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5 text-accent" />
                    Physical Measurements
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => handleEditStep(4)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Height:</span> {sessionData.physical?.height_ft}' {sessionData.physical?.height_in}"</div>
                  <div><span className="text-muted-foreground">Wrist-to-Floor:</span> {sessionData.physical?.wrist_to_floor}"</div>
                  <div><span className="text-muted-foreground">Hand Size:</span> {sessionData.physical?.hand_size}</div>
                  <div><span className="text-muted-foreground">Mobility:</span> {sessionData.physical?.mobility_limit}</div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Physical Limitations:</span> {sessionData.physical?.injuries?.join(", ")}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Current Equipment */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5 text-accent" />
                    Current Equipment
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => handleEditStep(5)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {sessionData.equipment?.club_brand && (
                    <div><span className="text-muted-foreground">Brand:</span> {sessionData.equipment.club_brand}</div>
                  )}
                  <div><span className="text-muted-foreground">Club Length:</span> {sessionData.equipment?.club_length}</div>
                  <div><span className="text-muted-foreground">Shaft Flex:</span> {sessionData.equipment?.shaft_flex}</div>
                  <div><span className="text-muted-foreground">Grip Size:</span> {sessionData.equipment?.grip_size}</div>
                  <div><span className="text-muted-foreground">Satisfaction:</span> {sessionData.equipment?.satisfaction}/5 stars</div>
                  {sessionData.equipment?.pain_points && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">Pain Points:</span> {sessionData.equipment.pain_points}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-6">
                <Button onClick={() => handleEditStep(5)} variant="outline" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={isGenerating}
                  size="lg"
                  className="bg-accent hover:bg-accent/90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing your fitting data...
                    </>
                  ) : (
                    "Generate My Fitting Recommendations"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}