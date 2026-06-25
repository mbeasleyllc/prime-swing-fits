import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

export default function Step2() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [typicalShot, setTypicalShot] = useState("");
  const [missTendency, setMissTendency] = useState("");
  const [ballFlight, setBallFlight] = useState("");
  const [swingTempo, setSwingTempo] = useState("");
  const [swingStrength, setSwingStrength] = useState("");

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;
      
      const { data } = await supabase
        .from("swing_profile")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setTypicalShot(data.typical_shot || "");
        setMissTendency(data.miss_tendency || "");
        setBallFlight(data.ball_flight || "");
        setSwingTempo(data.swing_tempo || "");
        setSwingStrength(data.swing_strength || "");
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user]);

  const isFormValid = typicalShot && missTendency && ballFlight && swingTempo && swingStrength;

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/1`);
  };

  const handleNext = async () => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    // Check if swing profile exists
    const { data: existingProfile } = await supabase
      .from("swing_profile")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    let profileError;
    
    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from("swing_profile")
        .update({
          typical_shot: typicalShot,
          miss_tendency: missTendency,
          ball_flight: ballFlight,
          swing_tempo: swingTempo,
          swing_strength: swingStrength,
        })
        .eq("session_id", sessionId);
      profileError = error;
    } else {
      // Insert new profile
      const { error } = await supabase
        .from("swing_profile")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          typical_shot: typicalShot,
          miss_tendency: missTendency,
          ball_flight: ballFlight,
          swing_tempo: swingTempo,
          swing_strength: swingStrength,
        });
      profileError = error;
    }

    if (profileError) {
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    const { error: sessionError } = await supabase
      .from("fitting_sessions")
      .update({ current_step: 3 })
      .eq("id", sessionId);

    if (sessionError) {
      console.error("Failed to update session step:", sessionError);
    }

    toast({
      title: "Progress saved ✓",
      description: "Moving to next step...",
    });

    router.push(`/fitting/${sessionId}/step/3`);
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
          <ProgressBar currentStep={2} totalSteps={6} />

          <Card>
            <CardHeader>
              <CardTitle>Swing Profile</CardTitle>
              <CardDescription>Help us understand your typical swing characteristics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="typicalShot">
                  Typical Shot Shape <span className="text-destructive">*</span>
                </Label>
                <Select value={typicalShot} onValueChange={setTypicalShot}>
                  <SelectTrigger id="typicalShot">
                    <SelectValue placeholder="Select shot shape" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="draw">Draw</SelectItem>
                    <SelectItem value="slice">Slice</SelectItem>
                    <SelectItem value="hook">Hook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="missTendency">
                  Miss Tendency <span className="text-destructive">*</span>
                </Label>
                <Select value={missTendency} onValueChange={setMissTendency}>
                  <SelectTrigger id="missTendency">
                    <SelectValue placeholder="Select miss direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ballFlight">
                  Typical Ball Flight <span className="text-destructive">*</span>
                </Label>
                <Select value={ballFlight} onValueChange={setBallFlight}>
                  <SelectTrigger id="ballFlight">
                    <SelectValue placeholder="Select ball flight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="swingTempo">
                  Swing Tempo <span className="text-destructive">*</span>
                </Label>
                <Select value={swingTempo} onValueChange={setSwingTempo}>
                  <SelectTrigger id="swingTempo">
                    <SelectValue placeholder="Select tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="swingStrength">
                  Swing Strength <span className="text-destructive">*</span>
                </Label>
                <Select value={swingStrength} onValueChange={setSwingStrength}>
                  <SelectTrigger id="swingStrength">
                    <SelectValue placeholder="Select strength" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <Button onClick={handleBack} variant="outline" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!isFormValid || isSaving}
                  size="lg"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Next
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