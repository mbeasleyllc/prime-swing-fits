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

const wedgesSchema = z.object({
  current_wedges: z.array(z.string()).optional(),
  wedges_make: z.string().optional(),
  wedges_model: z.string().optional(),
  wedges_loft_gaps: z.string().optional(),
  wedges_spin_performance: z.enum(["too_little", "below_average", "adequate", "good", "excellent"]),
  wedges_greenside_feel: z.enum(["too_hard", "firm", "balanced", "soft", "very_soft"]),
  wedges_bunker_performance: z.enum(["struggle", "inconsistent", "adequate", "confident", "excellent"]),
  wedges_shot_types: z.array(z.enum(["full_swing", "pitch", "chip", "flop", "bunker", "bump_run"])),
  wedges_distance_control: z.enum(["poor", "fair", "good", "very_good", "excellent"]),
  wedges_grind_pref: z.enum(["low_bounce", "standard_bounce", "high_bounce", "versatile", "no_preference"]),
  wedges_shot_versatility_importance: z.enum(["not_important", "somewhat_important", "important", "very_important", "critical"]),
  wedges_primary_goal: z.enum(["more_spin", "better_distance_control", "versatility", "bunker_improvement", "consistency"]),
  wedges_additional_notes: z.string().optional(),
});

type WedgesData = z.infer<typeof wedgesSchema>;

const SHOT_TYPES = [
  { id: "full_swing", label: "Full swing (50-120 yards)" },
  { id: "pitch", label: "Pitch shots (30-50 yards)" },
  { id: "chip", label: "Chip shots (10-30 yards)" },
  { id: "flop", label: "Flop shots (high, soft)" },
  { id: "bunker", label: "Bunker/sand shots" },
  { id: "bump_run", label: "Bump and run" },
] as const;

export default function Step3Wedges() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<WedgesData>({
    resolver: zodResolver(wedgesSchema),
    defaultValues: {
      current_wedges: [],
      wedges_spin_performance: "adequate",
      wedges_greenside_feel: "balanced",
      wedges_bunker_performance: "adequate",
      wedges_shot_types: [],
      wedges_distance_control: "good",
      wedges_grind_pref: "standard_bounce",
      wedges_shot_versatility_importance: "important",
      wedges_primary_goal: "consistency",
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
          current_wedges: (data.current_wedges as any) || [],
          wedges_make: data.wedges_make || undefined,
          wedges_model: data.wedges_model || undefined,
          wedges_loft_gaps: data.wedges_loft_gaps || undefined,
          wedges_spin_performance: (data.wedges_spin_performance as any) || "adequate",
          wedges_greenside_feel: (data.wedges_greenside_feel as any) || "balanced",
          wedges_bunker_performance: (data.wedges_bunker_performance as any) || "adequate",
          wedges_shot_types: (data.wedges_shot_types as any) || [],
          wedges_distance_control: (data.wedges_distance_control as any) || "good",
          wedges_grind_pref: (data.wedges_grind_pref as any) || "standard_bounce",
          wedges_shot_versatility_importance: (data.wedges_shot_versatility_importance as any) || "important",
          wedges_primary_goal: (data.wedges_primary_goal as any) || "consistency",
          wedges_additional_notes: data.wedges_additional_notes || undefined,
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const onSubmit = async (values: WedgesData) => {
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
      title: "Wedges data saved ✓",
      description: "Moving to next section...",
    });

    const nextPath = getNextStepPath("3-wedges", selectedCategories);
    router.push(`/fitting/${sessionId}/step/${nextPath || "4"}`);
  };

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    const prevPath = getPreviousStepPath("3-wedges", selectedCategories);
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
  const currentStep = getCurrentStepNumber("3-wedges", selectedCategories);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        
        <Card>
          <CardHeader>
            <CardTitle>Wedges Fitting</CardTitle>
            <CardDescription>
              Help us understand your wedge game and short game needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Current Equipment</h3>
                  
                  <FormField
                    control={form.control}
                    name="current_wedges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Which wedges do you currently use?</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., PW (46°), GW (52°), SW (56°), LW (60°)"
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                            onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          />
                        </FormControl>
                        <FormDescription>List your wedges with lofts (e.g., PW 46°, SW 56°)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="wedges_make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make/Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Titleist, Cleveland" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wedges_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Vokey SM9, RTX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="wedges_loft_gaps"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Loft Gap Concerns</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Too big gap between 52° and 56°"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Any distance or loft gaps you're trying to fill?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Performance & Feel</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="wedges_spin_performance"
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
                              <SelectItem value="too_little">Too Little - Ball runs out</SelectItem>
                              <SelectItem value="below_average">Below Average</SelectItem>
                              <SelectItem value="adequate">Adequate</SelectItem>
                              <SelectItem value="good">Good - Stops well</SelectItem>
                              <SelectItem value="excellent">Excellent - Tour-level spin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wedges_greenside_feel"
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
                              <SelectItem value="too_hard">Too Hard - No feedback</SelectItem>
                              <SelectItem value="firm">Firm</SelectItem>
                              <SelectItem value="balanced">Balanced</SelectItem>
                              <SelectItem value="soft">Soft</SelectItem>
                              <SelectItem value="very_soft">Very Soft - Buttery</SelectItem>
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
                      name="wedges_bunker_performance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bunker Performance <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="struggle">Struggle - Major weakness</SelectItem>
                              <SelectItem value="inconsistent">Inconsistent</SelectItem>
                              <SelectItem value="adequate">Adequate</SelectItem>
                              <SelectItem value="confident">Confident</SelectItem>
                              <SelectItem value="excellent">Excellent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wedges_distance_control"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance Control <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="poor">Poor - Very inconsistent</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="very_good">Very Good</SelectItem>
                              <SelectItem value="excellent">Excellent - Dialed in</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Shot Types & Versatility</h3>
                  
                  <FormField
                    control={form.control}
                    name="wedges_shot_types"
                    render={() => (
                      <FormItem>
                        <FormLabel>Which shots do you regularly play? <span className="text-destructive">*</span></FormLabel>
                        <FormDescription>Select all that apply</FormDescription>
                        <div className="space-y-2 mt-2">
                          {SHOT_TYPES.map((shot) => (
                            <FormField
                              key={shot.id}
                              control={form.control}
                              name="wedges_shot_types"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(shot.id as any)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, shot.id]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== shot.id));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {shot.label}
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
                      name="wedges_grind_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bounce/Grind Preference <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low_bounce">Low Bounce (4-8°) - Tight lies</SelectItem>
                              <SelectItem value="standard_bounce">Standard Bounce (10-12°)</SelectItem>
                              <SelectItem value="high_bounce">High Bounce (14°+) - Soft turf</SelectItem>
                              <SelectItem value="versatile">Versatile - Multiple conditions</SelectItem>
                              <SelectItem value="no_preference">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wedges_shot_versatility_importance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shot Versatility Importance <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_important">Not Important</SelectItem>
                              <SelectItem value="somewhat_important">Somewhat Important</SelectItem>
                              <SelectItem value="important">Important</SelectItem>
                              <SelectItem value="very_important">Very Important</SelectItem>
                              <SelectItem value="critical">Critical - Need options</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Ability to open face, play different trajectories</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="wedges_primary_goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Goal for Wedges <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="more_spin">More Spin Control</SelectItem>
                          <SelectItem value="better_distance_control">Better Distance Control</SelectItem>
                          <SelectItem value="versatility">Shot Versatility</SelectItem>
                          <SelectItem value="bunker_improvement">Bunker Play Improvement</SelectItem>
                          <SelectItem value="consistency">Overall Consistency</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wedges_additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other details about your wedge preferences or short game..."
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

// Force server-side rendering (skip static generation at build time)
export async function getServerSideProps() {
  return {
    props: {},
  };
}