import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { MeasurementTooltip } from "@/components/wizard/MeasurementTooltip";
import { UnitToggle } from "@/components/wizard/UnitToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { playerProfileSchema, type PlayerProfile } from "@/lib/wizardValidation";
import { feetInchesToCm, cmToFeetInches } from "@/lib/unitConversion";
import { getNextStepPath, getTotalSteps, getCurrentStepNumber } from "@/lib/fittingStepRouter";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function Step1() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [unitPreference, setUnitPreference] = useState<"imperial" | "metric">("imperial");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<PlayerProfile>({
    resolver: zodResolver(playerProfileSchema),
    defaultValues: {
      player_name: "",
      player_age: 35,
      handedness: "right",
      unit_preference: "imperial",
      height_ft: 5,
      height_in: 10,
      height_cm: 178,
      wrist_to_floor: 34,
      glove_size: "M",
      hand_length: undefined,
      longest_finger: undefined,
      has_physical_limitations: false,
      physical_limitations_text: "",
    },
  });

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;
      
      const { data, error } = await supabase
        .from("fitting_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (data) {
        const unit = (data.unit_preference as "imperial" | "metric") || "imperial";
        setUnitPreference(unit);
        
        if (data.selected_categories && Array.isArray(data.selected_categories)) {
          setSelectedCategories(data.selected_categories as string[]);
        }
        
        form.reset({
          player_name: data.player_name || "",
          player_age: data.player_age || 35,
          handedness: (data.handedness as "right" | "left") || "right",
          unit_preference: unit,
          height_ft: data.height_ft || 5,
          height_in: data.height_in || 10,
          height_cm: data.height_cm || 178,
          wrist_to_floor: data.wrist_to_floor || 34,
          glove_size: (data.glove_size as "S" | "M" | "ML" | "L" | "XL") || "M",
          hand_length: data.hand_length || undefined,
          longest_finger: data.longest_finger || undefined,
          has_physical_limitations: data.has_physical_limitations || false,
          physical_limitations_text: data.physical_limitations_text || "",
        });

        if (data.hand_length || data.longest_finger) {
          setShowAdvanced(true);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnitPreference(newUnit);
    form.setValue("unit_preference", newUnit);

    if (newUnit === "metric") {
      const feet = form.getValues("height_ft") || 5;
      const inches = form.getValues("height_in") || 10;
      const cm = feetInchesToCm(feet, inches);
      form.setValue("height_cm", cm);
    } else {
      const cm = form.getValues("height_cm") || 178;
      const { feet, inches } = cmToFeetInches(cm);
      form.setValue("height_ft", feet);
      form.setValue("height_in", inches);
    }
  };

  const onSubmit = async (values: PlayerProfile) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        player_name: values.player_name,
        player_age: values.player_age,
        handedness: values.handedness,
        unit_preference: values.unit_preference,
        height_ft: values.height_ft,
        height_in: values.height_in,
        height_cm: values.height_cm,
        wrist_to_floor: values.wrist_to_floor,
        glove_size: values.glove_size,
        hand_length: values.hand_length,
        longest_finger: values.longest_finger,
        has_physical_limitations: values.has_physical_limitations,
        physical_limitations_text: values.physical_limitations_text,
        current_step: 2,
      })
      .eq("id", sessionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    toast({
      title: "Progress saved ✓",
      description: "Moving to golf experience...",
    });

    const nextPath = getNextStepPath("1", selectedCategories);
    router.push(`/fitting/${sessionId}/step/${nextPath || "2"}`);
  };

  const totalSteps = getTotalSteps(selectedCategories);
  const currentStep = getCurrentStepNumber("1", selectedCategories);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Section 1: Player Profile</CardTitle>
                  <CardDescription>Basic information about you and your physical measurements</CardDescription>
                </div>
                <UnitToggle unit={unitPreference} onUnitChange={handleUnitChange} />
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="player_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="player_age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              min={10}
                              max={100}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="handedness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Handedness <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="right">Right</SelectItem>
                              <SelectItem value="left">Left</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {unitPreference === "imperial" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="height_ft"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (Feet) <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                min={3}
                                max={8}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="height_in"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (Inches) <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                min={0}
                                max={11}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="height_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm) <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              min={90}
                              max={250}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="wrist_to_floor"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Wrist-to-Floor (inches) <span className="text-destructive">*</span></FormLabel>
                          <MeasurementTooltip type="wrist-to-floor" />
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            min={20}
                            max={50}
                            step={0.5}
                            placeholder="34"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="glove_size"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Golf Glove Size <span className="text-destructive">*</span></FormLabel>
                          <MeasurementTooltip type="glove-size" />
                        </div>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="S">Small</SelectItem>
                            <SelectItem value="M">Medium</SelectItem>
                            <SelectItem value="ML">Medium-Large</SelectItem>
                            <SelectItem value="L">Large</SelectItem>
                            <SelectItem value="XL">X-Large</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full justify-between"
                    >
                      <span>Advanced Measurements (Optional)</span>
                      {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>

                    {showAdvanced && (
                      <div className="space-y-4 mt-4">
                        <FormField
                          control={form.control}
                          name="hand_length"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel>Hand Length (inches)</FormLabel>
                                <MeasurementTooltip type="hand-length" />
                              </div>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  min={6}
                                  max={12}
                                  step={0.1}
                                  placeholder="7.5"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="longest_finger"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel>Longest Finger (inches)</FormLabel>
                                <MeasurementTooltip type="finger-length" />
                              </div>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  min={2}
                                  max={5}
                                  step={0.1}
                                  placeholder="3.5"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="has_physical_limitations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I have physical limitations or injuries</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("has_physical_limitations") && (
                    <FormField
                      control={form.control}
                      name="physical_limitations_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please describe</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="e.g., Lower back issues, shoulder injury..."
                              className="resize-none"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      size="lg"
                    >
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Next
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

// Force server-side rendering (skip static generation at build time)
export async function getServerSideProps() {
  return {
    props: {},
  };
}