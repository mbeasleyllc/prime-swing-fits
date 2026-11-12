import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const putterSchema = z.object({
  putter_current_length: z.number().min(28).max(40).optional(),
  putter_current_make: z.string().max(50).optional(),
  putter_current_model: z.string().max(50).optional(),
  putter_eye_position: z.enum(["inside", "over", "outside", "unsure"]),
  putter_posture: z.enum(["upright", "moderate", "bent"]),
  putter_stroke_type: z.enum(["straight", "slight_arc", "moderate_arc", "strong_arc"]),
  putter_common_miss: z.enum(["left", "right", "short", "long", "inconsistent_speed"]).optional(),
  putter_head_style_pref: z.enum(["blade", "mid_mallet", "mallet", "no_preference"]),
  putter_alignment_pref: z.enum(["minimal", "moderate", "prominent"]),
  putter_feel_pref: z.enum(["soft", "medium", "firm"]),
  putter_grip_size_pref: z.enum(["standard", "midsize", "oversize"]),
  putter_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]),
});

type PutterData = z.infer<typeof putterSchema>;

export default function Step7() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PutterData>({
    resolver: zodResolver(putterSchema),
    defaultValues: {
      putter_eye_position: "over",
      putter_posture: "moderate",
      putter_stroke_type: "slight_arc",
      putter_head_style_pref: "mid_mallet",
      putter_alignment_pref: "moderate",
      putter_feel_pref: "medium",
      putter_grip_size_pref: "standard",
      putter_satisfaction: "neutral",
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
          putter_current_length: (data as any).putter_current_length || undefined,
          putter_current_make: (data as any).putter_current_make || undefined,
          putter_current_model: (data as any).putter_current_model || undefined,
          putter_eye_position: (data as any).putter_eye_position || "over",
          putter_posture: (data as any).putter_posture || "moderate",
          putter_stroke_type: (data as any).putter_stroke_type || "slight_arc",
          putter_common_miss: (data as any).putter_common_miss,
          putter_head_style_pref: (data as any).putter_head_style_pref || "mid_mallet",
          putter_alignment_pref: (data as any).putter_alignment_pref || "moderate",
          putter_feel_pref: (data as any).putter_feel_pref || "medium",
          putter_grip_size_pref: (data as any).putter_grip_size_pref || "standard",
          putter_satisfaction: (data as any).putter_satisfaction || "neutral",
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const onSubmit = async (values: PutterData) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        putter_current_length: values.putter_current_length,
        putter_current_make: values.putter_current_make,
        putter_current_model: values.putter_current_model,
        putter_eye_position: values.putter_eye_position,
        putter_posture: values.putter_posture,
        putter_stroke_type: values.putter_stroke_type,
        putter_common_miss: values.putter_common_miss,
        putter_head_style_pref: values.putter_head_style_pref,
        putter_alignment_pref: values.putter_alignment_pref,
        putter_feel_pref: values.putter_feel_pref,
        putter_grip_size_pref: values.putter_grip_size_pref,
        putter_satisfaction: values.putter_satisfaction,
        current_step: 8,
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
      title: "Putter data saved ✓",
      description: "Moving to golf ball fitting...",
    });

    router.push(`/fitting/${sessionId}/step/8`);
  };

  const handleBack = () => {
    router.push(`/fitting/${id}/step/6`);
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
        <ProgressBar currentStep={7} totalSteps={9} />

        <div className="mt-8">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Putter Fitting 🎱</h2>
              <p className="text-muted-foreground">
                Find the right putter specs for your stroke
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Current Putter</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="putter_current_make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make/Brand</FormLabel>
                          <FormControl>
                            <input {...field} placeholder="e.g., Scotty Cameron" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="putter_current_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <input {...field} placeholder="e.g., Newport 2" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="putter_current_length"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Current Length (inches)</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            min={28}
                            max={40}
                            step={0.25}
                            placeholder="34"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="putter_satisfaction"
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
                  <h3 className="text-lg font-semibold mb-4">Setup & Posture</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="putter_eye_position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eye Position <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="inside">Inside the ball</SelectItem>
                              <SelectItem value="over">Directly over</SelectItem>
                              <SelectItem value="outside">Outside the ball</SelectItem>
                              <SelectItem value="unsure">Not sure</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Where your eyes are relative to the ball</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="putter_posture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Putting Posture <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="upright">Upright - More standing</SelectItem>
                              <SelectItem value="moderate">Moderate bend</SelectItem>
                              <SelectItem value="bent">Bent over - Low hands</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Stroke Characteristics</h3>
                  
                  <FormField
                    control={form.control}
                    name="putter_stroke_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stroke Path <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="straight">Straight back & through</SelectItem>
                            <SelectItem value="slight_arc">Slight arc</SelectItem>
                            <SelectItem value="moderate_arc">Moderate arc</SelectItem>
                            <SelectItem value="strong_arc">Strong arc</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>How your putter moves during the stroke</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="putter_common_miss"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Most Common Miss</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select miss pattern" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left">Misses left</SelectItem>
                            <SelectItem value="right">Misses right</SelectItem>
                            <SelectItem value="short">Leaves putts short</SelectItem>
                            <SelectItem value="long">Putts run past</SelectItem>
                            <SelectItem value="inconsistent_speed">Inconsistent speed control</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                  
                  <FormField
                    control={form.control}
                    name="putter_head_style_pref"
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
                            <SelectItem value="blade">Blade - Traditional look</SelectItem>
                            <SelectItem value="mid_mallet">Mid-Mallet - Modern classic</SelectItem>
                            <SelectItem value="mallet">Full Mallet - High MOI</SelectItem>
                            <SelectItem value="no_preference">No Preference</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="putter_alignment_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alignment Aids <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="minimal">Minimal - Clean look</SelectItem>
                              <SelectItem value="moderate">Moderate - Single line</SelectItem>
                              <SelectItem value="prominent">Prominent - Multiple aids</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="putter_feel_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feel Preference <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="soft">Soft - Muted feedback</SelectItem>
                              <SelectItem value="medium">Medium - Balanced</SelectItem>
                              <SelectItem value="firm">Firm - Crisp feedback</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="putter_grip_size_pref"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Grip Size Preference <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="midsize">Midsize - Slightly larger</SelectItem>
                            <SelectItem value="oversize">Oversize - SuperStroke style</SelectItem>
                          </SelectContent>
                        </Select>
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