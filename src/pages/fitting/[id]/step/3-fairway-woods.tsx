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

const fairwayWoodsSchema = z.object({
  current_fairway_woods: z.array(z.enum(["3W", "5W", "7W", "9W", "none"])).optional(),
  fairway_woods_make: z.string().optional(),
  fairway_woods_model: z.string().optional(),
  fairway_woods_usage: z.array(z.enum(["tee_shots", "fairway_long_approach", "rough_recovery", "tight_lies"])),
  fairway_woods_distance_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]),
  fairway_woods_accuracy_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]),
  fairway_woods_yardage_gap_3w: z.number().optional(),
  fairway_woods_yardage_gap_5w: z.number().optional(),
  fairway_woods_shot_shape: z.enum(["slice", "fade", "straight", "draw", "hook"]),
  fairway_woods_trajectory: z.enum(["too_low", "low", "ideal", "high", "too_high"]),
  fairway_woods_airborne_difficulty: z.enum(["very_difficult", "difficult", "moderate", "easy", "very_easy"]),
  fairway_woods_head_size_pref: z.enum(["compact", "standard", "oversized", "no_preference"]),
  fairway_woods_shaft_feel_pref: z.enum(["stiff_stable", "moderate", "soft_responsive", "no_preference"]),
  fairway_woods_primary_goal: z.enum(["more_distance", "better_accuracy", "easier_launch", "gap_filling", "versatility"]),
  fairway_woods_additional_notes: z.string().optional(),
});

type FairwayWoodsData = z.infer<typeof fairwayWoodsSchema>;

const USAGE_OPTIONS = [
  { id: "tee_shots", label: "Tee shots on par 3s/4s" },
  { id: "fairway_long_approach", label: "Long approach shots from fairway" },
  { id: "rough_recovery", label: "Recovery shots from rough" },
  { id: "tight_lies", label: "Tight/firm fairway lies" },
] as const;

export default function Step3FairwayWoods() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<FairwayWoodsData>({
    resolver: zodResolver(fairwayWoodsSchema),
    defaultValues: {
      current_fairway_woods: [],
      fairway_woods_usage: [],
      fairway_woods_distance_satisfaction: "neutral",
      fairway_woods_accuracy_satisfaction: "neutral",
      fairway_woods_shot_shape: "straight",
      fairway_woods_trajectory: "ideal",
      fairway_woods_airborne_difficulty: "moderate",
      fairway_woods_head_size_pref: "standard",
      fairway_woods_shaft_feel_pref: "moderate",
      fairway_woods_primary_goal: "better_accuracy",
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
          current_fairway_woods: (data.current_fairway_woods as any) || [],
          fairway_woods_make: data.fairway_woods_make || undefined,
          fairway_woods_model: data.fairway_woods_model || undefined,
          fairway_woods_usage: (data.fairway_woods_usage as any) || [],
          fairway_woods_distance_satisfaction: (data.fairway_woods_distance_satisfaction as any) || "neutral",
          fairway_woods_accuracy_satisfaction: (data.fairway_woods_accuracy_satisfaction as any) || "neutral",
          fairway_woods_yardage_gap_3w: data.fairway_woods_yardage_gap_3w || undefined,
          fairway_woods_yardage_gap_5w: data.fairway_woods_yardage_gap_5w || undefined,
          fairway_woods_shot_shape: (data.fairway_woods_shot_shape as any) || "straight",
          fairway_woods_trajectory: (data.fairway_woods_trajectory as any) || "ideal",
          fairway_woods_airborne_difficulty: (data.fairway_woods_airborne_difficulty as any) || "moderate",
          fairway_woods_head_size_pref: (data.fairway_woods_head_size_pref as any) || "standard",
          fairway_woods_shaft_feel_pref: (data.fairway_woods_shaft_feel_pref as any) || "moderate",
          fairway_woods_primary_goal: (data.fairway_woods_primary_goal as any) || "better_accuracy",
          fairway_woods_additional_notes: data.fairway_woods_additional_notes || undefined,
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const onSubmit = async (values: FairwayWoodsData) => {
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
      title: "Fairway woods data saved ✓",
      description: "Moving to next section...",
    });

    const nextPath = getNextStepPath("3-fairway-woods", selectedCategories);
    router.push(`/fitting/${sessionId}/step/${nextPath || "4"}`);
  };

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    const prevPath = getPreviousStepPath("3-fairway-woods", selectedCategories);
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
  const currentStep = getCurrentStepNumber("3-fairway-woods", selectedCategories);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        
        <Card>
          <CardHeader>
            <CardTitle>Fairway Woods Fitting</CardTitle>
            <CardDescription>
              Help us understand your fairway wood preferences and performance goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Current Equipment</h3>
                  
                  <FormField
                    control={form.control}
                    name="current_fairway_woods"
                    render={() => (
                      <FormItem>
                        <FormLabel>Which fairway woods do you currently use?</FormLabel>
                        <div className="space-y-2">
                          {["3W", "5W", "7W", "9W", "none"].map((wood) => (
                            <FormField
                              key={wood}
                              control={form.control}
                              name="current_fairway_woods"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(wood as any)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current.filter(v => v !== "none"), wood]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== wood));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {wood === "none" ? "None / Don't have fairway woods" : wood}
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
                      name="fairway_woods_make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make/Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., TaylorMade, Callaway" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fairway_woods_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., SIM2, Rogue ST" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Usage & Performance</h3>
                  
                  <FormField
                    control={form.control}
                    name="fairway_woods_usage"
                    render={() => (
                      <FormItem>
                        <FormLabel>When do you typically use fairway woods? <span className="text-destructive">*</span></FormLabel>
                        <FormDescription>Select all that apply</FormDescription>
                        <div className="space-y-2 mt-2">
                          {USAGE_OPTIONS.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="fairway_woods_usage"
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
                      name="fairway_woods_distance_satisfaction"
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
                      name="fairway_woods_accuracy_satisfaction"
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

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="fairway_woods_yardage_gap_3w"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>3-Wood Carry Distance (yards)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="e.g., 220"
                            />
                          </FormControl>
                          <FormDescription>Average carry yardage</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fairway_woods_yardage_gap_5w"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>5-Wood Carry Distance (yards)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="e.g., 200"
                            />
                          </FormControl>
                          <FormDescription>Average carry yardage</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Ball Flight & Launch</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fairway_woods_shot_shape"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typical Shot Shape <span className="text-destructive">*</span></FormLabel>
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
                      name="fairway_woods_trajectory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ball Flight Trajectory <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="too_low">Too Low (struggles to get airborne)</SelectItem>
                              <SelectItem value="low">Low (penetrating)</SelectItem>
                              <SelectItem value="ideal">Ideal (optimal apex)</SelectItem>
                              <SelectItem value="high">High (towering)</SelectItem>
                              <SelectItem value="too_high">Too High (ballooning)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fairway_woods_airborne_difficulty"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>How difficult is it to get fairway woods airborne? <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="very_difficult">Very Difficult - Struggle constantly</SelectItem>
                            <SelectItem value="difficult">Difficult - Only works sometimes</SelectItem>
                            <SelectItem value="moderate">Moderate - Takes effort but manageable</SelectItem>
                            <SelectItem value="easy">Easy - Launch with confidence</SelectItem>
                            <SelectItem value="very_easy">Very Easy - No issues at all</SelectItem>
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
                      name="fairway_woods_head_size_pref"
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
                              <SelectItem value="compact">Compact (traditional, workable)</SelectItem>
                              <SelectItem value="standard">Standard (balanced)</SelectItem>
                              <SelectItem value="oversized">Oversized (forgiving)</SelectItem>
                              <SelectItem value="no_preference">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fairway_woods_shaft_feel_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shaft Feel Preference <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="stiff_stable">Stiff & Stable (low launch)</SelectItem>
                              <SelectItem value="moderate">Moderate (balanced)</SelectItem>
                              <SelectItem value="soft_responsive">Soft & Responsive (high launch)</SelectItem>
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
                    name="fairway_woods_primary_goal"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Primary Goal for Fairway Woods <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="more_distance">More Distance</SelectItem>
                            <SelectItem value="better_accuracy">Better Accuracy</SelectItem>
                            <SelectItem value="easier_launch">Easier to Launch</SelectItem>
                            <SelectItem value="gap_filling">Fill Distance Gaps</SelectItem>
                            <SelectItem value="versatility">Versatility (multiple uses)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fairway_woods_additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other details about your fairway wood preferences or issues..."
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