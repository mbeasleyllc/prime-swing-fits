import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Step1() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [dominantHand, setDominantHand] = useState("");
  const [experience, setExperience] = useState("");
  const [handicap, setHandicap] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;
      
      const { data, error } = await supabase
        .from("player_profile")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setFullName(data.full_name || "");
        setAge(data.age?.toString() || "");
        setDominantHand(data.dominant_hand || "");
        setExperience(data.experience || "");
        setHandicap(data.handicap || "");
        setPrimaryGoal(data.primary_goal || "");
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user]);

  const isFormValid = fullName && age && dominantHand && experience && handicap && primaryGoal;

  const handleNext = async () => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error: profileError } = await supabase
      .from("player_profile")
      .upsert({
        session_id: sessionId,
        user_id: user.id,
        full_name: fullName,
        age: parseInt(age),
        dominant_hand: dominantHand,
        experience,
        handicap,
        primary_goal: primaryGoal,
      }, {
        onConflict: "session_id",
      });

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
      .update({ current_step: 2 })
      .eq("id", sessionId);

    if (sessionError) {
      console.error("Failed to update session step:", sessionError);
    }

    toast({
      title: "Progress saved ✓",
      description: "Moving to next step...",
    });

    router.push(`/fitting/${sessionId}/step/2`);
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
          <ProgressBar currentStep={1} totalSteps={6} />

          <Card>
            <CardHeader>
              <CardTitle>Player Profile</CardTitle>
              <CardDescription>Tell us about your golf background and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">
                  Age <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="10"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="35"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dominantHand">
                  Dominant Hand <span className="text-destructive">*</span>
                </Label>
                <Select value={dominantHand} onValueChange={setDominantHand}>
                  <SelectTrigger id="dominantHand">
                    <SelectValue placeholder="Select hand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">
                  Experience Level <span className="text-destructive">*</span>
                </Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handicap">
                  Handicap <span className="text-destructive">*</span>
                </Label>
                <Select value={handicap} onValueChange={setHandicap}>
                  <SelectTrigger id="handicap">
                    <SelectValue placeholder="Select handicap" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="0-5">0-5</SelectItem>
                    <SelectItem value="6-15">6-15</SelectItem>
                    <SelectItem value="16-25">16-25</SelectItem>
                    <SelectItem value="26+">26+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryGoal">
                  Primary Goal <span className="text-destructive">*</span>
                </Label>
                <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
                  <SelectTrigger id="primaryGoal">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                    <SelectItem value="consistency">Consistency</SelectItem>
                    <SelectItem value="all_around">All-Around</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4 pt-4">
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