import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { golfExperienceSchema, type GolfExperience } from "@/lib/wizardValidation";
import { getNextStepPath, getPreviousStepPath, getTotalSteps, getCurrentStepNumber } from "@/lib/fittingStepRouter";
import { Loader2, ArrowLeft } from "lucide-react";

export default function Step2() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<GolfExperience>({
    resolver: zodResolver(golfExperienceSchema),
    defaultValues: {
      experience_level: "intermediate",
      handicap_index: undefined,
      handicap_goal: undefined,
      average_score: undefined,
      years_playing: "1-3",
      playing_frequency: "weekly",
      practice_frequency: "weekly",
      ball_striking_quality: "decent",
      has_clubs: true,
      clubs_age: undefined,
      replacement_scope: undefined,
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
          experience_level: (data.experience_level as any) || "intermediate",
          handicap_index: data.handicap_index || undefined,
          handicap_goal: data.handicap_goal || undefined,
          average_score: data.average_score || undefined,
          years_playing: (data.years_playing as any) || "1-3",
          playing_frequency: (data.playing_frequency as any) || "weekly",
          practice_frequency: (data.practice_frequency as any) || "weekly",
          ball_striking_quality: (data.ball_striking_quality as any) || "decent",
          has_clubs: data.has_clubs ?? true,
          clubs_age: (data.clubs_age as any) || undefined,
          replacement_scope: (data.replacement_scope as any) || undefined,
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    const prevPath = getPreviousStepPath("2", selectedCategories);
    router.push(`/fitting/${sessionId}/step/${prevPath || "1"}`);
  };

  const onSubmit = async (values: GolfExperience) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        experience_level: values.experience_level,
        handicap_index: values.handicap_index,
        handicap_goal: values.handicap_goal,
        average_score: values.average_score,
        years_playing: values.years_playing,
        playing_frequency: values.playing_frequency,
        practice_frequency: values.practice_frequency,
        ball_striking_quality: values.ball_striking_quality,
        has_clubs: values.has_clubs,
        clubs_age: values.clubs_age,
        replacement_scope: values.replacement_scope,
        current_step: 3,
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
      description: "Moving to next section...",
    });

    const nextPath = getNextStepPath("2", selectedCategories);
    router.push(`/fitting/${sessionId}/step/${nextPath || "3"}`);
  };

  const totalSteps = getTotalSteps(selectedCategories);
  const currentStep = getCurrentStepNumber("2", selectedCategories);

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
              <CardTitle>Section 2: Golf Experience & Ability</CardTitle>
              <CardDescription>Help us understand your skill level and playing habits</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="experience_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner - Still learning fundamentals</SelectItem>
                            <SelectItem value="intermediate">Intermediate - Consistent contact, developing skills</SelectItem>
                            <SelectItem value="advanced">Advanced - Confident player, low handicap</SelectItem>
                            <SelectItem value="expert">Expert - Competitive level, scratch or better</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="handicap_index"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Handicap Index</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              min={-5}
                              max={54}
                              step={0.1}
                              placeholder="12.5"
                            />
                          </FormControl>
                          <FormDescription>Your official USGA handicap</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="handicap_goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Handicap Goal</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              min={-5}
                              max={54}
                              step={0.1}
                              placeholder="8.0"
                            />
                          </FormControl>
                          <FormDescription>Where you'd like to be</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="average_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Score</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            min={60}
                            max={150}
                            placeholder="90"
                          />
                        </FormControl>
                        <FormDescription>Typical 18-hole score</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ball_striking_quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ball-Striking Quality <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="struggling">Struggling - Frequent mishits</SelectItem>
                            <SelectItem value="inconsistent">Inconsistent - Good shots mixed with poor</SelectItem>
                            <SelectItem value="decent">Decent - Mostly solid contact</SelectItem>
                            <SelectItem value="solid">Solid - Consistently good contact</SelectItem>
                            <SelectItem value="excellent">Excellent - Very rare mishits</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="years_playing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years Playing <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select years" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10_plus">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="playing_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Playing Frequency <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="rarely">Rarely (few times per year)</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="multiple_weekly">Multiple times per week</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="practice_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Practice Frequency <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="rarely">Rarely</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="multiple_weekly">Multiple times per week</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Including range, putting green, short game</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Current Club Situation</h3>
                    
                    <FormField
                      control={form.control}
                      name="has_clubs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Do you currently have golf clubs? <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value ? "true" : "false"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No - First set</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("has_clubs") && (
                      <>
                        <FormField
                          control={form.control}
                          name="clubs_age"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>How old are your clubs?</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select age" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="new">New (less than 1 year)</SelectItem>
                                  <SelectItem value="1-2_years">1-2 years</SelectItem>
                                  <SelectItem value="3-5_years">3-5 years</SelectItem>
                                  <SelectItem value="5-10_years">5-10 years</SelectItem>
                                  <SelectItem value="10_plus_years">10+ years</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="replacement_scope"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>What are you looking to replace?</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select scope" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="full_bag">Full bag / Complete set</SelectItem>
                                  <SelectItem value="one_club">Just one specific club</SelectItem>
                                  <SelectItem value="partial_set">Partial set (woods/irons/wedges)</SelectItem>
                                  <SelectItem value="undecided">Not sure yet</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
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