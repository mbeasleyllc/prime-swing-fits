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

export default function Step3() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [turfType, setTurfType] = useState("");
  const [typicalWeather, setTypicalWeather] = useState("");
  const [ballUsed, setBallUsed] = useState("");

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;
      
      const { data } = await supabase
        .from("course_conditions")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setTurfType(data.turf_type || "");
        setTypicalWeather(data.typical_weather || "");
        setBallUsed(data.ball_used || "");
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user]);

  const isFormValid = turfType && typicalWeather && ballUsed;

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/2`);
  };

  const handleNext = async () => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    // Check if course conditions exist
    const { data: existingConditions } = await supabase
      .from("course_conditions")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    let conditionsError;
    
    if (existingConditions) {
      // Update existing conditions
      const { error } = await supabase
        .from("course_conditions")
        .update({
          turf_type: turfType,
          typical_weather: typicalWeather,
          ball_used: ballUsed,
        })
        .eq("session_id", sessionId);
      conditionsError = error;
    } else {
      // Insert new conditions
      const { error } = await supabase
        .from("course_conditions")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          turf_type: turfType,
          typical_weather: typicalWeather,
          ball_used: ballUsed,
        });
      conditionsError = error;
    }

    if (conditionsError) {
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
      .update({ current_step: 4 })
      .eq("id", sessionId);

    if (sessionError) {
      console.error("Failed to update session step:", sessionError);
    }

    toast({
      title: "Progress saved ✓",
      description: "Moving to next step...",
    });

    router.push(`/fitting/${sessionId}/step/4`);
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
          <ProgressBar currentStep={3} totalSteps={6} />

          <Card>
            <CardHeader>
              <CardTitle>Course Conditions</CardTitle>
              <CardDescription>Tell us about the typical conditions you play in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="turfType">
                  Typical Turf Type <span className="text-destructive">*</span>
                </Label>
                <Select value={turfType} onValueChange={setTurfType}>
                  <SelectTrigger id="turfType">
                    <SelectValue placeholder="Select turf type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft">Soft</SelectItem>
                    <SelectItem value="firm">Firm</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="typicalWeather">
                  Typical Weather <span className="text-destructive">*</span>
                </Label>
                <Select value={typicalWeather} onValueChange={setTypicalWeather}>
                  <SelectTrigger id="typicalWeather">
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="windy">Windy</SelectItem>
                    <SelectItem value="varied">Varied</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ballUsed">
                  Ball Typically Used <span className="text-destructive">*</span>
                </Label>
                <Select value={ballUsed} onValueChange={setBallUsed}>
                  <SelectTrigger id="ballUsed">
                    <SelectValue placeholder="Select ball type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="control">Control</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
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