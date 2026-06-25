import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Star } from "lucide-react";

export default function Step5() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [clubBrand, setClubBrand] = useState("");
  const [clubLength, setClubLength] = useState("");
  const [shaftFlex, setShaftFlex] = useState("");
  const [gripSize, setGripSize] = useState("");
  const [satisfaction, setSatisfaction] = useState(0);
  const [painPoints, setPainPoints] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;
      
      const { data } = await supabase
        .from("current_equipment")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setClubBrand(data.club_brand || "");
        setClubLength(data.club_length || "");
        setShaftFlex(data.shaft_flex || "");
        setGripSize(data.grip_size || "");
        setSatisfaction(data.satisfaction || 0);
        setPainPoints(data.pain_points || "");
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user]);

  const isFormValid = clubLength && shaftFlex && gripSize && satisfaction > 0;

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/4`);
  };

  const handleNext = async () => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    // Check if current equipment exists
    const { data: existingEquipment } = await supabase
      .from("current_equipment")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    let equipmentError;
    
    if (existingEquipment) {
      // Update existing equipment
      const { error } = await supabase
        .from("current_equipment")
        .update({
          club_brand: clubBrand || null,
          club_length: clubLength,
          shaft_flex: shaftFlex,
          grip_size: gripSize,
          satisfaction,
          pain_points: painPoints || null,
        })
        .eq("session_id", sessionId);
      equipmentError = error;
    } else {
      // Insert new equipment
      const { error } = await supabase
        .from("current_equipment")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          club_brand: clubBrand || null,
          club_length: clubLength,
          shaft_flex: shaftFlex,
          grip_size: gripSize,
          satisfaction,
          pain_points: painPoints || null,
        });
      equipmentError = error;
    }

    if (equipmentError) {
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
      .update({ current_step: 6 })
      .eq("id", sessionId);

    if (sessionError) {
      console.error("Failed to update session step:", sessionError);
    }

    toast({
      title: "Progress saved ✓",
      description: "Moving to final step...",
    });

    router.push(`/fitting/${sessionId}/step/6`);
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
          <ProgressBar currentStep={5} totalSteps={6} />

          <Card>
            <CardHeader>
              <CardTitle>Current Equipment</CardTitle>
              <CardDescription>Tell us about your current clubs to help us make better recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clubBrand">Current Club Brand (Optional)</Label>
                <Input
                  id="clubBrand"
                  value={clubBrand}
                  onChange={(e) => setClubBrand(e.target.value)}
                  placeholder="e.g., Titleist, Callaway, TaylorMade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clubLength">
                  Current Club Length <span className="text-destructive">*</span>
                </Label>
                <Select value={clubLength} onValueChange={setClubLength}>
                  <SelectTrigger id="clubLength">
                    <SelectValue placeholder="Select club length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="longer">Longer than standard</SelectItem>
                    <SelectItem value="shorter">Shorter than standard</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shaftFlex">
                  Current Shaft Flex <span className="text-destructive">*</span>
                </Label>
                <Select value={shaftFlex} onValueChange={setShaftFlex}>
                  <SelectTrigger id="shaftFlex">
                    <SelectValue placeholder="Select shaft flex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L - Ladies</SelectItem>
                    <SelectItem value="A">A - Senior</SelectItem>
                    <SelectItem value="R">R - Regular</SelectItem>
                    <SelectItem value="S">S - Stiff</SelectItem>
                    <SelectItem value="X">X - Extra Stiff</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gripSize">
                  Current Grip Size <span className="text-destructive">*</span>
                </Label>
                <Select value={gripSize} onValueChange={setGripSize}>
                  <SelectTrigger id="gripSize">
                    <SelectValue placeholder="Select grip size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undersize">Undersize</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="midsize">Midsize</SelectItem>
                    <SelectItem value="oversize">Oversize</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Satisfaction with Current Clubs <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSatisfaction(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredStar || satisfaction)
                            ? "fill-accent text-accent"
                            : "fill-none text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {satisfaction === 0 && "Select a rating"}
                  {satisfaction === 1 && "Very dissatisfied"}
                  {satisfaction === 2 && "Dissatisfied"}
                  {satisfaction === 3 && "Neutral"}
                  {satisfaction === 4 && "Satisfied"}
                  {satisfaction === 5 && "Very satisfied"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="painPoints">
                  What bothers you most about your current clubs? (Optional)
                </Label>
                <Textarea
                  id="painPoints"
                  value={painPoints}
                  onChange={(e) => setPainPoints(e.target.value)}
                  placeholder="e.g., inconsistent distance, difficult to hit straight, uncomfortable grip..."
                  maxLength={300}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {painPoints.length}/300 characters
                </p>
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