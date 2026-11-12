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

const ironsSchema = z.object({
  irons_current_make: z.string().max(50).optional(),
  irons_current_model: z.string().max(50).optional(),
  irons_custom_fitted: z.enum(["yes", "no", "unsure"]),
  irons_set_composition: z.string().optional(),
  irons_7iron_distance: z.number().min(50).max(250).optional(),
  irons_ball_flight: z.enum(["too_low", "low", "ideal", "high", "too_high"]),
  irons_shot_shape: z.enum(["big_slice", "fade", "straight", "draw", "big_hook"]),
  irons_miss_pattern: z.array(z.string()),
  irons_consistency: z.enum(["very_inconsistent", "inconsistent", "decent", "consistent", "very_consistent"]),
  irons_turf_interaction: z.enum(["dig_deep", "slight_dig", "neutral", "sweep"]),
  irons_trajectory_preference: z.enum(["low_piercing", "mid", "high_soft"]),
  irons_workability_importance: z.enum(["not_important", "somewhat_important", "very_important"]),
  irons_forgiveness_priority: z.enum(["low", "medium", "high"]),
  irons_length_preference: z.enum(["shorter", "standard", "longer", "custom"]),
  irons_choke_down_frequency: z.enum(["never", "rarely", "sometimes", "often", "always"]),
});

type IronsData = z.infer<typeof ironsSchema>;

const MISS_PATTERNS = [
  { id: "thin", label: "Thin shots" },
  { id: "fat", label: "Fat/chunked" },
  { id: "toe", label: "Toe hits" },
  { id: "heel", label: "Heel hits" },
  { id: "push", label: "Push right" },
  { id: "pull", label: "Pull left" },
  { id: "inconsistent_distance", label: "Inconsistent distance" },
  { id: "low_flight", label: "Low ball flight" },
];

export default function Step3Irons() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<IronsData>({
    resolver: zodResolver(ironsSchema),
    defaultValues: {
      irons_custom_fitted: "unsure",
      irons_ball_flight: "ideal",
      irons_shot_shape: "straight",
      irons_miss_pattern: [],
      irons_consistency: "decent",
      irons_turf_interaction: "neutral",
      irons_trajectory_preference: "mid",
      irons_workability_importance: "somewhat_important",
      irons_forgiveness_priority: "medium",
      irons_length_preference: "standard",
      irons_choke_down_frequency: "sometimes",
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
          irons_current_make: (data as any).irons_current_make || undefined,
          irons_current_model: (data as any).irons_current_model || undefined,
          irons_custom_fitted: (data as any).irons_custom_fitted || "unsure",
          irons_set_composition: (data as any).irons_set_composition || undefined,
          irons_7iron_distance: (data as any).irons_7iron_distance || undefined,
          irons_ball_flight: (data as any).irons_ball_flight || "ideal",
          irons_shot_shape: (data as any).irons_shot_shape || "straight",
          irons_miss_pattern: (data as any).irons_miss_pattern || [],
          irons_consistency: (data as any).irons_consistency || "decent",
          irons_turf_interaction: (data as any).irons_turf_interaction || "neutral",
          irons_trajectory_preference: (data as any).irons_trajectory_preference || "mid",
          irons_workability_importance: (data as any).irons_workability_importance || "somewhat_important",
          irons_forgiveness_priority: (data as any).irons_forgiveness_priority || "medium",
          irons_length_preference: (data as any).irons_length_preference || "standard",
          irons_choke_down_frequency: (data as any).irons_choke_down_frequency || "sometimes",
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const onSubmit = async (values: IronsData) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        irons_current_make: values.irons_current_make,
        irons_current_model: values.irons_current_model,
        irons_custom_fitted: values.irons_custom_fitted,
        irons_set_composition: values.irons_set_composition,
        irons_7iron_distance: values.irons_7iron_distance,
        irons_ball_flight: values.irons_ball_flight,
        irons_shot_shape: values.irons_shot_shape,
        irons_miss_pattern: values.irons_miss_pattern,
        irons_consistency: values.irons_consistency,
        irons_turf_interaction: values.irons_turf_interaction,
        irons_trajectory_preference: values.irons_trajectory_preference,
        irons_workability_importance: values.irons_workability_importance,
        irons_forgiveness_priority: values.irons_forgiveness_priority,
        irons_length_preference: values.irons_length_preference,
        irons_choke_down_frequency: values.irons_choke_down_frequency,
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
      title: "Irons data saved ✓",
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Iron Fitting 🔧</h2>
              <p className="text-muted-foreground">
                Help us understand your iron performance and preferences
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Current Iron Set</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="irons_current_make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make/Brand</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Titleist" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="irons_current_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., T200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="irons_custom_fitted"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Were your irons custom fitted? <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Yes - Custom fitted</SelectItem>
                            <SelectItem value="no">No - Off the rack</SelectItem>
                            <SelectItem value="unsure">Not sure</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="irons_set_composition"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Set Composition</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 4-PW or 5-GW" />
                        </FormControl>
                        <FormDescription>Which irons are in your current set</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="irons_7iron_distance"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>7-Iron Carry Distance (yards)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            min={50}
                            max={250}
                            placeholder="150"
                          />
                        </FormControl>
                        <FormDescription>Average carry, not total distance</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Ball Flight & Performance</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="irons_ball_flight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typical Trajectory <span className="text-destructive">*</span></FormLabel>
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

                    <FormField
                      control={form.control}
                      name="irons_shot_shape"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shot Shape <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="big_slice">Big Slice (right)</SelectItem>
                              <SelectItem value="fade">Fade (small right)</SelectItem>
                              <SelectItem value="straight">Straight</SelectItem>
                              <SelectItem value="draw">Draw (small left)</SelectItem>
                              <SelectItem value="big_hook">Big Hook (left)</SelectItem>
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
                      name="irons_consistency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overall Consistency <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="very_inconsistent">Very Inconsistent</SelectItem>
                              <SelectItem value="inconsistent">Inconsistent</SelectItem>
                              <SelectItem value="decent">Decent</SelectItem>
                              <SelectItem value="consistent">Consistent</SelectItem>
                              <SelectItem value="very_consistent">Very Consistent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="irons_turf_interaction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Turf Interaction <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dig_deep">Dig Deep (steep)</SelectItem>
                              <SelectItem value="slight_dig">Slight Dig</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="sweep">Sweep (shallow)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How you strike the turf</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="irons_miss_pattern"
                    render={() => (
                      <FormItem className="mt-4">
                        <FormLabel>Common Miss Patterns (select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {MISS_PATTERNS.map((pattern) => (
                            <FormField
                              key={pattern.id}
                              control={form.control}
                              name="irons_miss_pattern"
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
                  <h3 className="text-lg font-semibold mb-4">Preferences & Priorities</h3>
                  
                  <FormField
                    control={form.control}
                    name="irons_trajectory_preference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Trajectory <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low_piercing">Low Piercing - Windy conditions</SelectItem>
                            <SelectItem value="mid">Mid - Versatile</SelectItem>
                            <SelectItem value="high_soft">High & Soft - Stopping power</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="irons_workability_importance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shot Shaping Ability <span className="text-destructive">*</span></FormLabel>
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
                          <FormDescription>Ability to work shots left/right</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="irons_forgiveness_priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Forgiveness Priority <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low - Player iron</SelectItem>
                              <SelectItem value="medium">Medium - Game improvement</SelectItem>
                              <SelectItem value="high">High - Super game improvement</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Length & Setup</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="irons_length_preference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length Preference <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="shorter">Shorter than standard</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="longer">Longer than standard</SelectItem>
                              <SelectItem value="custom">Need custom measurement</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="irons_choke_down_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choke Down Frequency <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="never">Never</SelectItem>
                              <SelectItem value="rarely">Rarely</SelectItem>
                              <SelectItem value="sometimes">Sometimes</SelectItem>
                              <SelectItem value="often">Often</SelectItem>
                              <SelectItem value="always">Always</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How often you grip down from the end</FormDescription>
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