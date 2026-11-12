import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const driverSchema = z.object({
  current_driver_loft: z.number().min(7).max(15).optional(),
  current_driver_flex: z.enum(["ladies", "senior", "regular", "stiff", "x-stiff"]).optional(),
  current_driver_length: z.number().min(43).max(48).optional(),
  current_driver_make: z.string().max(50).optional(),
  current_driver_model: z.string().max(50).optional(),
  driver_distance_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]),
  driver_accuracy_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]),
  driver_ball_flight: z.enum(["slice", "fade", "straight", "draw", "hook"]),
  driver_trajectory: z.enum(["too_low", "low", "ideal", "high", "too_high"]),
  driver_miss_pattern: z.array(z.string()),
  driver_swing_speed: z.enum(["under_80", "80-90", "90-100", "100-110", "110_plus"]),
  driver_tempo: z.enum(["smooth", "moderate", "aggressive"]),
  driver_performance_goals: z.array(z.string()),
  driver_head_size_pref: z.enum(["traditional_440", "460cc", "no_preference"]),
  driver_sound_pref: z.enum(["loud", "moderate", "muted", "no_preference"]),
  driver_adjustability_importance: z.enum(["not_important", "somewhat_important", "very_important"]),
});

type DriverData = z.infer<typeof driverSchema>;

const MISS_PATTERNS = [
  { id: "slice", label: "Slice (big curve right)" },
  { id: "fade", label: "Fade (small curve right)" },
  { id: "push", label: "Push (straight right)" },
  { id: "pull", label: "Pull (straight left)" },
  { id: "draw", label: "Draw (small curve left)" },
  { id: "hook", label: "Hook (big curve left)" },
  { id: "thin", label: "Thin/Topped" },
  { id: "inconsistent", label: "Inconsistent contact" },
];

const PERFORMANCE_GOALS = [
  { id: "more_distance", label: "More distance" },
  { id: "better_accuracy", label: "Better accuracy/fairways" },
  { id: "consistent_contact", label: "More consistent contact" },
  { id: "higher_launch", label: "Higher launch angle" },
  { id: "lower_spin", label: "Lower spin rate" },
  { id: "fix_slice", label: "Fix slice/fade" },
  { id: "fix_hook", label: "Fix hook/draw" },
  { id: "better_feel", label: "Better feel/feedback" },
];

export default function Step3Driver() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<DriverData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      driver_distance_satisfaction: "neutral",
      driver_accuracy_satisfaction: "neutral",
      driver_ball_flight: "straight",
      driver_trajectory: "ideal",
      driver_miss_pattern: [],
      driver_swing_speed: "90-100",
      driver_tempo: "moderate",
      driver_performance_goals: [],
      driver_head_size_pref: "460cc",
      driver_sound_pref: "no_preference",
      driver_adjustability_importance: "somewhat_important",
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
        form.reset({
          current_driver_loft: data.current_driver_loft || undefined,
          current_driver_flex: (data.current_driver_flex as "ladies" | "senior" | "regular" | "stiff" | "x-stiff") || undefined,
          current_driver_length: data.current_driver_length || undefined,
          current_driver_make: data.current_driver_make || undefined,
          current_driver_model: data.current_driver_model || undefined,
          driver_distance_satisfaction: (data.driver_distance_satisfaction as "very_dissatisfied" | "dissatisfied" | "neutral" | "satisfied" | "very_satisfied") || "neutral",
          driver_accuracy_satisfaction: (data.driver_accuracy_satisfaction as "very_dissatisfied" | "dissatisfied" | "neutral" | "satisfied" | "very_satisfied") || "neutral",
          driver_ball_flight: (data.driver_ball_flight as "slice" | "fade" | "straight" | "draw" | "hook") || "straight",
          driver_trajectory: (data.driver_trajectory as "too_low" | "low" | "ideal" | "high" | "too_high") || "ideal",
          driver_miss_pattern: (data.driver_miss_pattern as string[]) || [],
          driver_swing_speed: (data.driver_swing_speed as "under_80" | "80-90" | "90-100" | "100-110" | "110_plus") || "90-100",
          driver_tempo: (data.driver_tempo as "smooth" | "moderate" | "aggressive") || "moderate",
          driver_performance_goals: (data.driver_performance_goals as string[]) || [],
          driver_head_size_pref: (data.driver_head_size_pref as "traditional_440" | "460cc" | "no_preference") || "460cc",
          driver_sound_pref: (data.driver_sound_pref as "loud" | "moderate" | "muted" | "no_preference") || "no_preference",
          driver_adjustability_importance: (data.driver_adjustability_importance as "not_important" | "somewhat_important" | "very_important") || "somewhat_important",
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const onSubmit = async (values: DriverData) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        ...values,
        current_step: 4,
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
      title: "Driver data saved ✓",
      description: "Moving to next section...",
    });

    router.push(`/fitting/${sessionId}/step/4`);
  };

  const handleBack = () => {
    router.push(`/fitting/${id}/step/2`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <ProgressBar currentStep={3} totalSteps={9} />

        <div className="mt-8">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Driver Fitting 🏌️</h2>
              <p className="text-muted-foreground">
                Help us understand your current driver performance and goals
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Current Driver Specs</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="current_driver_make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make/Brand</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., TaylorMade" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="current_driver_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Stealth 2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="current_driver_loft"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loft (°)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              min={7}
                              max={15}
                              step={0.5}
                              placeholder="10.5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="current_driver_flex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shaft Flex</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ladies">Ladies (L)</SelectItem>
                              <SelectItem value="senior">Senior (A)</SelectItem>
                              <SelectItem value="regular">Regular (R)</SelectItem>
                              <SelectItem value="stiff">Stiff (S)</SelectItem>
                              <SelectItem value="x-stiff">X-Stiff (X)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="current_driver_length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (in)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              min={43}
                              max={48}
                              step={0.25}
                              placeholder="45.5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Satisfaction</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="driver_distance_satisfaction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance Satisfaction <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="very_dissatisfied">Very Dissatisfied</SelectItem>
                              <SelectItem value="dissatisfied">Dissatisfied</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="satisfied">Satisfied</SelectItem>
                              <SelectItem value="very_satisfied">Very Satisfied</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="driver_accuracy_satisfaction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accuracy Satisfaction <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="very_dissatisfied">Very Dissatisfied</SelectItem>
                              <SelectItem value="dissatisfied">Dissatisfied</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="satisfied">Satisfied</SelectItem>
                              <SelectItem value="very_satisfied">Very Satisfied</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Ball Flight & Swing</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="driver_ball_flight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typical Ball Flight <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="slice">Slice (big right curve)</SelectItem>
                              <SelectItem value="fade">Fade (small right curve)</SelectItem>
                              <SelectItem value="straight">Straight</SelectItem>
                              <SelectItem value="draw">Draw (small left curve)</SelectItem>
                              <SelectItem value="hook">Hook (big left curve)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="driver_trajectory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Launch Trajectory <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="too_low">Too Low (worm burner)</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="ideal">Ideal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="too_high">Too High (ballooning)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="driver_swing_speed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Swing Speed (mph) <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under_80">Under 80 mph</SelectItem>
                              <SelectItem value="80-90">80-90 mph</SelectItem>
                              <SelectItem value="90-100">90-100 mph</SelectItem>
                              <SelectItem value="100-110">100-110 mph</SelectItem>
                              <SelectItem value="110_plus">110+ mph</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>If measured, or your best estimate</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="driver_tempo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Swing Tempo <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="smooth">Smooth / Slow</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="aggressive">Aggressive / Fast</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="driver_miss_pattern"
                    render={() => (
                      <FormItem className="mt-4">
                        <FormLabel>Common Miss Patterns (select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {MISS_PATTERNS.map((pattern) => (
                            <FormField
                              key={pattern.id}
                              control={form.control}
                              name="driver_miss_pattern"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(pattern.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, pattern.id])
                                          : field.onChange(field.value?.filter((value) => value !== pattern.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {pattern.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Goals</h3>
                  
                  <FormField
                    control={form.control}
                    name="driver_performance_goals"
                    render={() => (
                      <FormItem>
                        <FormLabel>What do you want to improve? (select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {PERFORMANCE_GOALS.map((goal) => (
                            <FormField
                              key={goal.id}
                              control={form.control}
                              name="driver_performance_goals"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(goal.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, goal.id])
                                          : field.onChange(field.value?.filter((value) => value !== goal.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {goal.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="driver_head_size_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Head Size Preference <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="traditional_440">Traditional 440cc</SelectItem>
                              <SelectItem value="460cc">Full-Size 460cc</SelectItem>
                              <SelectItem value="no_preference">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="driver_sound_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impact Sound Preference <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="loud">Loud / Explosive</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="muted">Muted / Soft</SelectItem>
                              <SelectItem value="no_preference">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="driver_adjustability_importance"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Adjustability Importance <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_important">Not Important - Set & Forget</SelectItem>
                            <SelectItem value="somewhat_important">Somewhat Important - Nice to Have</SelectItem>
                            <SelectItem value="very_important">Very Important - Must Have</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Adjustable weights, loft sleeves, face angle settings
                        </FormDescription>
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
          </Card>
        </div>
      </div>
    </div>
  );
}