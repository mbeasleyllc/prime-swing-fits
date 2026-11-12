import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { MeasurementTooltip } from "@/components/wizard/MeasurementTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { swingCharacteristicsSchema, type SwingCharacteristics } from "@/lib/wizardValidation";
import { Loader2, ArrowLeft } from "lucide-react";

const athleticBackgrounds = [
  "Baseball/Softball",
  "Tennis",
  "Hockey",
  "Basketball",
  "Football",
  "Soccer",
  "Track & Field",
  "Martial Arts",
  "None",
];

export default function Step4() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBackgrounds, setSelectedBackgrounds] = useState<string[]>([]);

  const form = useForm<SwingCharacteristics>({
    resolver: zodResolver(swingCharacteristicsSchema),
    defaultValues: {
      driver_swing_speed: "90-100",
      swing_tempo: "moderate",
      transition_speed: "average",
      swing_type: "neutral",
      athletic_background: [],
      typical_ball_flight: undefined,
      typical_trajectory: undefined,
      most_common_miss: undefined,
      miss_percentage: undefined,
      fairway_accuracy: undefined,
    },
  });

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;
      
      const { data } = await supabase
        .from("fitting_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (data) {
        const backgrounds = (data.athletic_background as string[]) || [];
        setSelectedBackgrounds(backgrounds);

        form.reset({
          driver_swing_speed: (data.driver_swing_speed as any) || "90-100",
          swing_tempo: (data.swing_tempo as any) || "moderate",
          transition_speed: (data.transition_speed as any) || "average",
          swing_type: (data.swing_type as any) || "neutral",
          athletic_background: backgrounds,
          typical_ball_flight: (data.typical_ball_flight as any) || undefined,
          typical_trajectory: (data.typical_trajectory as any) || undefined,
          most_common_miss: (data.most_common_miss as any) || undefined,
          miss_percentage: data.miss_percentage || undefined,
          fairway_accuracy: data.fairway_accuracy || undefined,
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const toggleBackground = (background: string) => {
    if (background === "None") {
      setSelectedBackgrounds(["None"]);
      form.setValue("athletic_background", ["None"]);
    } else {
      const filtered = selectedBackgrounds.filter(b => b !== "None");
      const newBackgrounds = selectedBackgrounds.includes(background)
        ? filtered.filter(b => b !== background)
        : [...filtered, background];
      setSelectedBackgrounds(newBackgrounds);
      form.setValue("athletic_background", newBackgrounds);
    }
  };

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/3`);
  };

  const onSubmit = async (values: SwingCharacteristics) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        driver_swing_speed: values.driver_swing_speed,
        swing_tempo: values.swing_tempo,
        transition_speed: values.transition_speed,
        swing_type: values.swing_type,
        athletic_background: selectedBackgrounds,
        typical_ball_flight: values.typical_ball_flight || null,
        typical_trajectory: values.typical_trajectory || null,
        most_common_miss: values.most_common_miss || null,
        miss_percentage: values.miss_percentage || null,
        fairway_accuracy: values.fairway_accuracy || null,
        current_step: 5,
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
      description: "Moving to long game...",
    });

    router.push(`/fitting/${sessionId}/step/5`);
  };

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
          <ProgressBar currentStep={4} totalSteps={8} />

          <Card>
            <CardHeader>
              <CardTitle>Section 4: Swing Characteristics</CardTitle>
              <CardDescription>Help us understand your swing dynamics</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="driver_swing_speed"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Driver Swing Speed <span className="text-destructive">*</span></FormLabel>
                          <MeasurementTooltip type="swing-speed" />
                        </div>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select speed" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under_70">Under 70 mph</SelectItem>
                            <SelectItem value="70-80">70-80 mph</SelectItem>
                            <SelectItem value="80-90">80-90 mph</SelectItem>
                            <SelectItem value="90-100">90-100 mph</SelectItem>
                            <SelectItem value="100-110">100-110 mph</SelectItem>
                            <SelectItem value="110_plus">110+ mph</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="swing_tempo"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Swing Tempo <span className="text-destructive">*</span></FormLabel>
                            <MeasurementTooltip type="tempo" />
                          </div>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tempo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="smooth">Smooth</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="aggressive">Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transition_speed"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Transition <span className="text-destructive">*</span></FormLabel>
                            <MeasurementTooltip type="transition" />
                          </div>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="smooth">Smooth</SelectItem>
                              <SelectItem value="average">Average</SelectItem>
                              <SelectItem value="quick">Quick</SelectItem>
                              <SelectItem value="very_aggressive">Very Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="swing_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Swing Type <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sweeper">Sweeper (shallow)</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="digger">Digger (steep)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Athletic Background</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {athleticBackgrounds.map((background) => (
                        <div key={background} className="flex items-center space-x-2">
                          <Checkbox
                            id={background}
                            checked={selectedBackgrounds.includes(background)}
                            onCheckedChange={() => toggleBackground(background)}
                          />
                          <label htmlFor={background} className="text-sm font-medium cursor-pointer">
                            {background}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="typical_ball_flight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typical Ball Flight</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select flight" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draw">Draw</SelectItem>
                              <SelectItem value="straight">Straight</SelectItem>
                              <SelectItem value="fade">Fade</SelectItem>
                              <SelectItem value="slice">Slice</SelectItem>
                              <SelectItem value="hook">Hook</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="typical_trajectory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typical Trajectory</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select trajectory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="most_common_miss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Most Common Miss</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select miss" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                            <SelectItem value="thin">Thin</SelectItem>
                            <SelectItem value="fat">Fat</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="miss_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Miss Percentage (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              min={0}
                              max={100}
                              placeholder="30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fairway_accuracy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fairway Accuracy (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              min={0}
                              max={100}
                              placeholder="60"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between gap-4 pt-4">
                    <Button onClick={handleBack} variant="outline" size="lg">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
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