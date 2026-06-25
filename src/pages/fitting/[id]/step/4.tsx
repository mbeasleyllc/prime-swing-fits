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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

export default function Step4() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [wristToFloor, setWristToFloor] = useState("");
  const [handSize, setHandSize] = useState("");
  const [injuries, setInjuries] = useState<string[]>([]);
  const [mobilityLimit, setMobilityLimit] = useState("");
  const [showWristVideo, setShowWristVideo] = useState(false);
  const [showHandVideo, setShowHandVideo] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;
      
      const { data } = await supabase
        .from("physical_profile")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setHeightFt(data.height_ft?.toString() || "");
        setHeightIn(data.height_in?.toString() || "");
        setWristToFloor(data.wrist_to_floor?.toString() || "");
        setHandSize(data.hand_size || "");
        setInjuries(data.injuries || []);
        setMobilityLimit(data.mobility_limit || "");
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user]);

  const handleInjuryToggle = (value: string) => {
    if (value === "none") {
      setInjuries(["none"]);
    } else {
      const filtered = injuries.filter((i) => i !== "none");
      if (injuries.includes(value)) {
        setInjuries(filtered.filter((i) => i !== value));
      } else {
        setInjuries([...filtered, value]);
      }
    }
  };

  const isFormValid = heightFt && heightIn && wristToFloor && handSize && injuries.length > 0 && mobilityLimit;

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/3`);
  };

  const handleNext = async () => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    // Check if physical profile exists
    const { data: existingProfile } = await supabase
      .from("physical_profile")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    let profileError;
    
    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from("physical_profile")
        .update({
          height_ft: parseInt(heightFt),
          height_in: parseInt(heightIn),
          wrist_to_floor: parseFloat(wristToFloor),
          hand_size: handSize,
          injuries,
          mobility_limit: mobilityLimit,
        })
        .eq("session_id", sessionId);
      profileError = error;
    } else {
      // Insert new profile
      const { error } = await supabase
        .from("physical_profile")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          height_ft: parseInt(heightFt),
          height_in: parseInt(heightIn),
          wrist_to_floor: parseFloat(wristToFloor),
          hand_size: handSize,
          injuries,
          mobility_limit: mobilityLimit,
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
      .update({ current_step: 5 })
      .eq("id", sessionId);

    if (sessionError) {
      console.error("Failed to update session step:", sessionError);
    }

    toast({
      title: "Progress saved ✓",
      description: "Moving to next step...",
    });

    router.push(`/fitting/${sessionId}/step/5`);
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
          <ProgressBar currentStep={4} totalSteps={6} />

          <Card>
            <CardHeader>
              <CardTitle>Physical Measurements</CardTitle>
              <CardDescription>Accurate measurements ensure the best club fitting recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heightFt">
                    Height - Feet <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="heightFt"
                    type="number"
                    min="4"
                    max="7"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heightIn">
                    Height - Inches <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="heightIn"
                    type="number"
                    min="0"
                    max="11"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wristToFloor">
                  Wrist-to-Floor Distance (inches) <span className="text-destructive">*</span>
                </Label>
                <Collapsible open={showWristVideo} onOpenChange={setShowWristVideo}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="mb-2 gap-2">
                      How to measure wrist-to-floor distance
                      {showWristVideo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mb-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">Video: How to Measure Wrist-to-Floor Distance</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <Input
                  id="wristToFloor"
                  type="number"
                  step="0.1"
                  min="25.0"
                  max="45.0"
                  value={wristToFloor}
                  onChange={(e) => setWristToFloor(e.target.value)}
                  placeholder="32.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handSize">
                  Hand Size <span className="text-destructive">*</span>
                </Label>
                <Collapsible open={showHandVideo} onOpenChange={setShowHandVideo}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="mb-2 gap-2">
                      How to measure your hand size
                      {showHandVideo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mb-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">Video: How to Measure Hand Size</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <Select value={handSize} onValueChange={setHandSize}>
                  <SelectTrigger id="handSize">
                    <SelectValue placeholder="Select hand size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra_large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Physical Limitations <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {["back", "wrist", "shoulder", "knee", "none"].map((injury) => (
                    <div key={injury} className="flex items-center space-x-2">
                      <Checkbox
                        id={injury}
                        checked={injuries.includes(injury)}
                        onCheckedChange={() => handleInjuryToggle(injury)}
                      />
                      <Label htmlFor={injury} className="font-normal capitalize cursor-pointer">
                        {injury}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobilityLimit">
                  Mobility Level <span className="text-destructive">*</span>
                </Label>
                <Select value={mobilityLimit} onValueChange={setMobilityLimit}>
                  <SelectTrigger id="mobilityLimit">
                    <SelectValue placeholder="Select mobility level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Limitations</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
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