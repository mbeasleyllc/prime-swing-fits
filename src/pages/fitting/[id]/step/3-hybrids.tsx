import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getNextStepPath, getPreviousStepPath, getTotalSteps, getCurrentStepNumber } from "@/lib/fittingStepRouter";

const hybridsSchema = z.object({
  current_hybrids: z.array(z.string()).optional(),
  hybrids_replace_long_irons: z.boolean(),
  hybrids_make: z.string().optional(),
  hybrids_model: z.string().optional(),
  hybrids_distance_gaps: z.array(z.enum(["180-200", "200-220", "220-240", "240_plus"])).optional(),
  hybrids_primary_usage: z.array(z.enum(["tee_shots", "fairway_approach", "rough_recovery", "tight_lies", "long_par3"])),
  hybrids_distance_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]),
  hybrids_accuracy_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]),
  hybrids_ball_flight: z.enum(["slice", "fade", "straight", "draw", "hook"]),
  hybrids_trajectory: z.enum(["too_low", "low", "ideal", "high", "too_high"]),
  hybrids_vs_fairway_woods: z.enum(["prefer_hybrids", "prefer_woods", "use_both", "unsure"]),
  hybrids_launch_difficulty: z.enum(["very_difficult", "difficult", "moderate", "easy", "very_easy"]),
  hybrids_head_style_pref: z.enum(["iron_like", "wood_like", "no_preference"]),
  hybrids_primary_goal: z.enum(["replace_long_irons", "fill_distance_gaps", "versatility", "easier_launch", "confidence_builder"]),
  hybrids_additional_notes: z.string().optional(),
});

type HybridsData = z.infer<typeof hybridsSchema>;

const USAGE_OPTIONS = [
  { id: "tee_shots", label: "Tee shots on long par 3s" },
  { id: "fairway_approach", label: "Approach shots from fairway" },
  { id: "rough_recovery", label: "Recovery from rough/trouble" },
  { id: "tight_lies", label: "Tight/firm lies" },
  { id: "long_par3", label: "Long par 3s (200+ yards)" },
] as const;

const DISTANCE_GAPS = [
  { id: "180-200", label: "180-200 yards" },
  { id: "200-220", label: "200-220 yards" },
  { id: "220-240", label: "220-240 yards" },
  { id: "240_plus", label: "240+ yards" },
] as const;

export default function Step3Hybrids() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<HybridsData>({
    resolver: zodResolver(hybridsSchema),
    defaultValues: {
      current_hybrids: [],
      hybrids_replace_long_irons: false,
      hybrids_distance_gaps: [],
      hybrids_primary_usage: [],
      hybrids_distance_satisfaction: "neutral",
      hybrids_accuracy_satisfaction: "neutral",
      hybrids_ball_flight: "straight",
      hybrids_trajectory: "ideal",
      hybrids_vs_fairway_woods: "use_both",
      hybrids_launch_difficulty: "moderate",
      hybrids_head_style_pref: "no_preference",
      hybrids_primary_goal: "fill_distance_gaps",
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
        if (data.selected_categories && Array.isArray(data.selected_categories)) {
          setSelectedCategories(data.selected_categories as string[]);
        }
        
        form.reset({
          current_hybrids: (data.current_hybrids as any) || [],
          hybrids_replace_long_irons: data.hybrids_replace_long_irons ?? false,
          hybrids_make: data.hybrids_make || undefined,
          hybrids_model: data.hybrids_model || undefined,
          hybrids_distance_gaps: (data.hybrids_distance_gaps as any) || [],
          hybrids_primary_usage: (data.hybrids_primary_usage as any) || [],
          hybrids_distance_satisfaction: (data.hybrids_distance_satisfaction as any) || "neutral",
          hybrids_accuracy_satisfaction: (data.hybrids_accuracy_satisfaction as any) || "neutral",
          hybrids_ball_flight: (data.hybrids_ball_flight as any) || "straight",
          hybrids_trajectory: (data.hybrids_trajectory as any) || "ideal",
          hybrids_vs_fairway_woods: (data.hybrids_vs_fairway_woods as any) || "use_both",
          hybrids_launch_difficulty: (data.hybrids_launch_difficulty as any) || "moderate",
          hybrids_head_style_pref: (data.hybrids_head_style_pref as any) || "no_preference",
          hybrids_primary_goal: (data.hybrids_primary_goal as any) || "fill_distance_gaps",
          hybrids_additional_notes: data.hybrids_additional_notes || undefined,
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const onSubmit = async (values: HybridsData) => {
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
      title: "Hybrids data saved ✓",
      description: "Moving to next section...",
    });

    const nextPath = getNextStepPath("3-hybrids", selectedCategories);
    router.push(`/fitting/${sessionId}/step/${nextPath || "4"}`);
  };

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    const prevPath = getPreviousStepPath("3-hybrids", selectedCategories);
    router.push(`/fitting/${sessionId}/step/${prevPath || "2"}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalSteps = getTotalSteps(selectedCategories);
  const currentStep = getCurrentStepNumber("3-hybrids", selectedCategories);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        
        <Card>
          <CardHeader>
            <CardTitle>Hybrids Fitting</CardTitle>
            <CardDescription>
              Help us understand your hybrid preferences and how they fit into your bag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Current Equipment & Intent</h3>
                  
                  <FormField
                    control={form.control}
                    name="current_hybrids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Which hybrids do you currently use?</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 3H (19°), 4H (22°)"
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                            onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          />
                        </FormControl>
                        <FormDescription>List the hybrids you have (e.g., 3H, 4H, 5H)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hybrids_replace_long_irons"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          I want to replace long irons (3i, 4i, 5i) with hybrids
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="hybrids_make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make/Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Ping, Titleist" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hybrids_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., G430, TSR" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Distance Gaps & Usage</h3>
                  
                  <FormField
                    control={form.control}
                    name="hybrids_distance_gaps"
                    render={() => (
                      <FormItem>
                        <FormLabel>Which distance gaps do you need to fill?</FormLabel>
                        <FormDescription>Select all that apply</FormDescription>
                        <div className="space-y-2 mt-2">
                          {DISTANCE_GAPS.map((gap) => (
                            <FormField
                              key={gap.id}
                              control={form.control}
                              name="hybrids_distance_gaps"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(gap.id as any)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, gap.id]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== gap.id));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {gap.label}
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

                  <FormField
                    control={form.control}
                    name="hybrids_primary_usage"
                    render={() => (
                      <FormItem className="mt-4">
                        <FormLabel>When do you typically use hybrids? <span className="text-destructive">*</span></FormLabel>
                        <FormDescription>Select all that apply</FormDescription>
                        <div className="space-y-2 mt-2">
                          {USAGE_OPTIONS.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="hybrids_primary_usage"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id as any)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, option.id]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== option.id));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {option.label}
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

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="hybrids_distance_satisfaction"
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
                      name="hybrids_accuracy_satisfaction"
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
                  <h3 className="text-lg font-semibold mb-4">Ball Flight & Performance</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hybrids_ball_flight"
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
                              <SelectItem value="slice">Slice (left to right, severe)</SelectItem>
                              <SelectItem value="fade">Fade (left to right, controlled)</SelectItem>
                              <SelectItem value="straight">Straight</SelectItem>
                              <SelectItem value="draw">Draw (right to left, controlled)</SelectItem>
                              <SelectItem value="hook">Hook (right to left, severe)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hybrids_trajectory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trajectory <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="too_low">Too Low</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="ideal">Ideal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="too_high">Too High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="hybrids_launch_difficulty"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>How easy is it to launch hybrids? <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="very_difficult">Very Difficult - Struggle constantly</SelectItem>
                            <SelectItem value="difficult">Difficult - Inconsistent</SelectItem>
                            <SelectItem value="moderate">Moderate - Takes focus</SelectItem>
                            <SelectItem value="easy">Easy - Generally confident</SelectItem>
                            <SelectItem value="very_easy">Very Easy - No issues</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hybrids_vs_fairway_woods"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Hybrids vs Fairway Woods <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="prefer_hybrids">Prefer hybrids - easier to hit</SelectItem>
                            <SelectItem value="prefer_woods">Prefer fairway woods</SelectItem>
                            <SelectItem value="use_both">Use both - each has a place</SelectItem>
                            <SelectItem value="unsure">Unsure - still figuring it out</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hybrids_head_style_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Head Style Preference <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="iron_like">Iron-like (compact, workable)</SelectItem>
                              <SelectItem value="wood_like">Wood-like (larger, forgiving)</SelectItem>
                              <SelectItem value="no_preference">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hybrids_primary_goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Goal <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="replace_long_irons">Replace long irons</SelectItem>
                              <SelectItem value="fill_distance_gaps">Fill distance gaps</SelectItem>
                              <SelectItem value="versatility">Versatility</SelectItem>
                              <SelectItem value="easier_launch">Easier launch</SelectItem>
                              <SelectItem value="confidence_builder">Confidence builder</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="hybrids_additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other details about your hybrid preferences or issues..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between gap-4 pt-4">
                  <Button onClick={handleBack} variant="outline" size="lg" type="button">
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
  );
}