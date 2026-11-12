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

const golfBallSchema = z.object({
  ball_current_brand: z.string().max(50).optional(),
  ball_current_model: z.string().max(50).optional(),
  ball_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]),
  ball_driver_performance: z.enum(["too_much_spin", "ideal_spin", "need_more_spin", "inconsistent"]),
  ball_driver_distance_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]),
  ball_iron_spin: z.enum(["too_low", "ideal", "too_high", "inconsistent"]),
  ball_iron_stopping_power: z.enum(["poor", "fair", "good", "excellent"]),
  ball_wedge_spin: z.enum(["minimal", "moderate", "high", "very_high"]),
  ball_greenside_feel: z.enum(["hard", "firm", "medium", "soft", "very_soft"]),
  ball_putting_feel_pref: z.enum(["hard", "firm", "medium", "soft", "very_soft"]),
  ball_putting_sound_pref: z.enum(["loud_click", "moderate", "soft_thud", "no_preference"]),
  ball_durability_importance: z.enum(["not_important", "somewhat_important", "very_important"]),
  ball_course_conditions: z.array(z.string()),
  ball_primary_priorities: z.array(z.string()),
  ball_budget: z.enum(["budget_friendly", "mid_range", "premium", "no_limit"]),
});

type GolfBallData = z.infer<typeof golfBallSchema>;

const COURSE_CONDITIONS = [
  { id: "firm_fast", label: "Firm & fast greens" },
  { id: "soft_slow", label: "Soft & slow greens" },
  { id: "windy", label: "Windy conditions" },
  { id: "wet_heavy", label: "Wet/heavy rough" },
  { id: "links_style", label: "Links-style courses" },
  { id: "tree_lined", label: "Tree-lined/tight courses" },
];

const PRIMARY_PRIORITIES = [
  { id: "distance", label: "Maximum distance" },
  { id: "control", label: "Control & accuracy" },
  { id: "spin", label: "Greenside spin" },
  { id: "feel", label: "Feel & feedback" },
  { id: "consistency", label: "Shot-to-shot consistency" },
  { id: "durability", label: "Durability/value" },
];

export default function Step8() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<GolfBallData>({
    resolver: zodResolver(golfBallSchema),
    defaultValues: {
      ball_satisfaction: "neutral",
      ball_driver_performance: "ideal_spin",
      ball_driver_distance_satisfaction: "neutral",
      ball_iron_spin: "ideal",
      ball_iron_stopping_power: "good",
      ball_wedge_spin: "moderate",
      ball_greenside_feel: "medium",
      ball_putting_feel_pref: "medium",
      ball_putting_sound_pref: "no_preference",
      ball_durability_importance: "somewhat_important",
      ball_course_conditions: [],
      ball_primary_priorities: [],
      ball_budget: "mid_range",
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
          ball_current_brand: (data as any).ball_current_brand || undefined,
          ball_current_model: (data as any).ball_current_model || undefined,
          ball_satisfaction: (data as any).ball_satisfaction || "neutral",
          ball_driver_performance: (data as any).ball_driver_performance || "ideal_spin",
          ball_driver_distance_satisfaction: (data as any).ball_driver_distance_satisfaction || "neutral",
          ball_iron_spin: (data as any).ball_iron_spin || "ideal",
          ball_iron_stopping_power: (data as any).ball_iron_stopping_power || "good",
          ball_wedge_spin: (data as any).ball_wedge_spin || "moderate",
          ball_greenside_feel: (data as any).ball_greenside_feel || "medium",
          ball_putting_feel_pref: (data as any).ball_putting_feel_pref || "medium",
          ball_putting_sound_pref: (data as any).ball_putting_sound_pref || "no_preference",
          ball_durability_importance: (data as any).ball_durability_importance || "somewhat_important",
          ball_course_conditions: (data as any).ball_course_conditions || [],
          ball_primary_priorities: (data as any).ball_primary_priorities || [],
          ball_budget: (data as any).ball_budget || "mid_range",
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const onSubmit = async (values: GolfBallData) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        ball_current_brand: values.ball_current_brand,
        ball_current_model: values.ball_current_model,
        ball_satisfaction: values.ball_satisfaction,
        ball_driver_performance: values.ball_driver_performance,
        ball_driver_distance_satisfaction: values.ball_driver_distance_satisfaction,
        ball_iron_spin: values.ball_iron_spin,
        ball_iron_stopping_power: values.ball_iron_stopping_power,
        ball_wedge_spin: values.ball_wedge_spin,
        ball_greenside_feel: values.ball_greenside_feel,
        ball_putting_feel_pref: values.ball_putting_feel_pref,
        ball_putting_sound_pref: values.ball_putting_sound_pref,
        ball_durability_importance: values.ball_durability_importance,
        ball_course_conditions: values.ball_course_conditions,
        ball_primary_priorities: values.ball_primary_priorities,
        ball_budget: values.ball_budget,
        current_step: 9,
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
      title: "Golf ball data saved ✓",
      description: "Moving to results...",
    });

    router.push(`/fitting/${sessionId}/results`);
  };

  const handleBack = () => {
    router.push(`/fitting/${id}/step/7`);
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
        <ProgressBar currentStep={8} totalSteps={9} />

        <div className="mt-8">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Golf Ball Fitting ⚪</h2>
              <p className="text-muted-foreground">
                Find the perfect golf ball to match your game
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Current Ball</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ball_current_brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Titleist" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ball_current_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Pro V1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="ball_satisfaction"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Overall Satisfaction <span className="text-destructive">*</span></FormLabel>
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

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Driver Performance</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ball_driver_performance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spin Performance <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="too_much_spin">Too Much Spin - Ballooning</SelectItem>
                              <SelectItem value="ideal_spin">Ideal Spin</SelectItem>
                              <SelectItem value="need_more_spin">Need More Spin - Low flight</SelectItem>
                              <SelectItem value="inconsistent">Inconsistent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ball_driver_distance_satisfaction"
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
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Iron & Approach Performance</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ball_iron_spin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Iron Spin <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="too_low">Too Low - Running out</SelectItem>
                              <SelectItem value="ideal">Ideal</SelectItem>
                              <SelectItem value="too_high">Too High - Ballooning</SelectItem>
                              <SelectItem value="inconsistent">Inconsistent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ball_iron_stopping_power"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stopping Power <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="poor">Poor - Too much roll</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="excellent">Excellent - Checks quickly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How quickly ball stops on greens</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Short Game & Feel</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ball_wedge_spin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wedge Spin Level <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="minimal">Minimal Spin</SelectItem>
                              <SelectItem value="moderate">Moderate Spin</SelectItem>
                              <SelectItem value="high">High Spin</SelectItem>
                              <SelectItem value="very_high">Very High Spin - Tour level</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ball_greenside_feel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Greenside Feel <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hard">Hard</SelectItem>
                              <SelectItem value="firm">Firm</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="soft">Soft</SelectItem>
                              <SelectItem value="very_soft">Very Soft - Tour urethane</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Current ball feel on chips/pitches</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="ball_putting_feel_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Putting Feel Preference <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hard">Hard</SelectItem>
                              <SelectItem value="firm">Firm</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="soft">Soft</SelectItem>
                              <SelectItem value="very_soft">Very Soft</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ball_putting_sound_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Putting Sound Preference <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="loud_click">Loud Click</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="soft_thud">Soft Thud</SelectItem>
                              <SelectItem value="no_preference">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Course Conditions</h3>
                  
                  <FormField
                    control={form.control}
                    name="ball_course_conditions"
                    render={() => (
                      <FormItem>
                        <FormLabel>Typical course conditions (select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {COURSE_CONDITIONS.map((condition) => (
                            <FormField
                              key={condition.id}
                              control={form.control}
                              name="ball_course_conditions"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(condition.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, condition.id])
                                          : field.onChange(field.value?.filter((value) => value !== condition.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {condition.label}
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
                  <h3 className="text-lg font-semibold mb-4">Priorities & Budget</h3>
                  
                  <FormField
                    control={form.control}
                    name="ball_primary_priorities"
                    render={() => (
                      <FormItem className="mb-4">
                        <FormLabel>Primary Priorities (select top 3)</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {PRIMARY_PRIORITIES.map((priority) => (
                            <FormField
                              key={priority.id}
                              control={form.control}
                              name="ball_primary_priorities"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(priority.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, priority.id])
                                          : field.onChange(field.value?.filter((value) => value !== priority.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {priority.label}
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ball_durability_importance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durability Importance <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_important">Not Important</SelectItem>
                              <SelectItem value="somewhat_important">Somewhat Important</SelectItem>
                              <SelectItem value="very_important">Very Important</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ball_budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Per Dozen <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="budget_friendly">Budget-Friendly ($20-30)</SelectItem>
                              <SelectItem value="mid_range">Mid-Range ($30-45)</SelectItem>
                              <SelectItem value="premium">Premium ($45-60)</SelectItem>
                              <SelectItem value="no_limit">No Limit - Best performance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                    Generate Recommendations
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

// Force server-side rendering (skip static generation at build time)
export async function getServerSideProps() {
  return {
    props: {},
  };
}