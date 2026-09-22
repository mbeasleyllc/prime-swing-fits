import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { putterFittingSchema, type PutterFitting } from "@/lib/wizardValidation";
import { Loader2, ArrowLeft } from "lucide-react";

export default function Step7() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PutterFitting>({
    resolver: zodResolver(putterFittingSchema),
    defaultValues: {
      putter_eye_position: undefined,
      putter_posture: undefined,
      putter_arm_hang: undefined,
      putter_sole_flush: undefined,
      putter_stroke_type: undefined,
      putter_face_rotation: undefined,
      putter_common_miss: undefined,
      putter_head_style_pref: undefined,
      putter_alignment_pref: undefined,
      putter_forgiveness_priority: undefined,
      putter_feel_pref: undefined,
      putter_green_speed: undefined,
      putter_forward_press: "no",
      putter_grip_size_pref: "standard",
      putter_hand_activity: undefined,
      putter_current_length: undefined,
      putter_satisfaction: undefined,
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
          putter_eye_position: (data.putter_eye_position as any) || undefined,
          putter_posture: (data.putter_posture as any) || undefined,
          putter_arm_hang: (data.putter_arm_hang as any) || undefined,
          putter_sole_flush: (data.putter_sole_flush as any) || undefined,
          putter_stroke_type: (data.putter_stroke_type as any) || undefined,
          putter_face_rotation: (data.putter_face_rotation as any) || undefined,
          putter_common_miss: (data.putter_common_miss as any) || undefined,
          putter_head_style_pref: (data.putter_head_style_pref as any) || undefined,
          putter_alignment_pref: (data.putter_alignment_pref as any) || undefined,
          putter_forgiveness_priority: (data.putter_forgiveness_priority as any) || undefined,
          putter_feel_pref: (data.putter_feel_pref as any) || undefined,
          putter_green_speed: (data.putter_green_speed as any) || undefined,
          putter_forward_press: data.putter_forward_press === true ? "yes" : "no",
          putter_grip_size_pref: (data.putter_grip_size_pref as string || "standard") as "standard" | "midsize" | "oversize",
          putter_hand_activity: (data.putter_hand_activity as any) || undefined,
          putter_current_length: data.putter_current_length || undefined,
          putter_satisfaction: (data.putter_satisfaction as any) || undefined,
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/6`);
  };

  const onSubmit = async (values: PutterFitting) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        putter_eye_position: values.putter_eye_position || null,
        putter_posture: values.putter_posture || null,
        putter_arm_hang: values.putter_arm_hang || null,
        putter_sole_flush: values.putter_sole_flush || null,
        putter_stroke_type: values.putter_stroke_type || null,
        putter_face_rotation: values.putter_face_rotation || null,
        putter_common_miss: values.putter_common_miss || null,
        putter_head_style_pref: values.putter_head_style_pref || null,
        putter_alignment_pref: values.putter_alignment_pref || null,
        putter_forgiveness_priority: values.putter_forgiveness_priority || null,
        putter_feel_pref: values.putter_feel_pref || null,
        putter_green_speed: values.putter_green_speed || null,
        putter_forward_press: values.putter_forward_press === "yes",
        putter_grip_size_pref: values.putter_grip_size_pref as any,
        putter_hand_activity: values.putter_hand_activity || null,
        putter_current_length: values.putter_current_length || null,
        putter_satisfaction: values.putter_satisfaction || null,
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
      title: "Progress saved ✓",
      description: "Moving to final step...",
    });

    router.push(`/fitting/${sessionId}/step/8`);
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
          <ProgressBar currentStep={7} totalSteps={8} />

          <Card>
            <CardHeader>
              <CardTitle>Section 7: Putter Fitting</CardTitle>
              <CardDescription>Let's find the perfect putter for your stroke</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Setup & Posture</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="putter_eye_position"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>Eye Position</FormLabel>
                              <MeasurementTooltip type="eye-position" />
                            </div>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="inside">Inside ball</SelectItem>
                                <SelectItem value="over">Over ball</SelectItem>
                                <SelectItem value="outside">Outside ball</SelectItem>
                                <SelectItem value="unsure">Unsure</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_posture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posture</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select posture" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="upright">Upright</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="bent">Bent over</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_arm_hang"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>Arm Hang</FormLabel>
                              <MeasurementTooltip type="arm-hang" />
                            </div>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select hang" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="natural">Natural/relaxed</SelectItem>
                                <SelectItem value="extended">Extended</SelectItem>
                                <SelectItem value="bent">Bent/close</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_sole_flush"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>Sole Flush</FormLabel>
                              <MeasurementTooltip type="sole-flush" />
                            </div>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="toe_up">Toe up</SelectItem>
                                <SelectItem value="flat">Flat</SelectItem>
                                <SelectItem value="heel_up">Heel up</SelectItem>
                                <SelectItem value="unsure">Unsure</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-sm">Stroke Characteristics</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="putter_stroke_type"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>Stroke Pattern</FormLabel>
                              <MeasurementTooltip type="stroke-arc" />
                            </div>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pattern" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="straight">Straight back/through</SelectItem>
                                <SelectItem value="slight_arc">Slight arc</SelectItem>
                                <SelectItem value="moderate_arc">Moderate arc</SelectItem>
                                <SelectItem value="strong_arc">Strong arc</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_face_rotation"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>Face Rotation</FormLabel>
                              <MeasurementTooltip type="face-rotation" />
                            </div>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rotation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="minimal">Minimal</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="significant">Significant</SelectItem>
                                <SelectItem value="unsure">Unsure</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_hand_activity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hand Activity</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select activity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="quiet">Quiet hands</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="active">Active hands</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_common_miss"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Typical Miss</FormLabel>
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
                                <SelectItem value="inconsistent_speed">Inconsistent speed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-sm">Preferences</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="putter_head_style_pref"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Head Style</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="blade">Blade</SelectItem>
                                <SelectItem value="mid_mallet">Mid-mallet</SelectItem>
                                <SelectItem value="mallet">Mallet</SelectItem>
                                <SelectItem value="no_preference">No preference</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_alignment_pref"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alignment Aid</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select preference" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="minimal">Minimal/none</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="prominent">Prominent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_forgiveness_priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Forgiveness Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low (prefer feel)</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="high">High (max forgiveness)</SelectItem>
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
                            <FormLabel>Feel Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select feel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="soft">Soft</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="firm">Firm</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_green_speed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Typical Green Speed</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select speed" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="slow">Slow (8-9)</SelectItem>
                                <SelectItem value="medium">Medium (9-11)</SelectItem>
                                <SelectItem value="fast">Fast (11+)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_forward_press"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Forward Press <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_grip_size_pref"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grip Size <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="midsize">Midsize</SelectItem>
                                <SelectItem value="oversize">Oversize/jumbo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="putter_current_length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Length (inches)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                min={28}
                                max={40}
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
                        name="putter_satisfaction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Putter Satisfaction</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Rate satisfaction" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="very_dissatisfied">Very dissatisfied</SelectItem>
                                <SelectItem value="dissatisfied">Dissatisfied</SelectItem>
                                <SelectItem value="neutral">Neutral</SelectItem>
                                <SelectItem value="satisfied">Satisfied</SelectItem>
                                <SelectItem value="very_satisfied">Very satisfied</SelectItem>
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