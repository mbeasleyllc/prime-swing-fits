import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { goalsPrioritiesSchema, type GoalsPriorities } from "@/lib/wizardValidation";
import { Loader2, ArrowLeft, Target } from "lucide-react";

const priorityOptions = [
  { key: "distance", label: "Distance", description: "Hit the ball farther" },
  { key: "accuracy", label: "Accuracy", description: "Hit more fairways/greens" },
  { key: "forgiveness", label: "Forgiveness", description: "Better results on off-center hits" },
  { key: "consistency", label: "Consistency", description: "Predictable shot patterns" },
  { key: "feel", label: "Feel", description: "Better feedback from impact" },
  { key: "workability", label: "Workability", description: "Shape shots intentionally" },
  { key: "launch", label: "Launch Height", description: "Optimize ball flight trajectory" },
  { key: "short_game", label: "Short Game", description: "Better wedge/bunker play" },
  { key: "putting", label: "Putting", description: "Make more putts" },
];

export default function Step8() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<GoalsPriorities>({
    resolver: zodResolver(goalsPrioritiesSchema),
    defaultValues: {
      distance: 3,
      accuracy: 3,
      forgiveness: 3,
      consistency: 3,
      feel: 3,
      workability: 3,
      launch: 3,
      short_game: 3,
      putting: 3,
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

      if (data && data.goals) {
        const goals = data.goals as any;
        form.reset({
          distance: goals.distance || 3,
          accuracy: goals.accuracy || 3,
          forgiveness: goals.forgiveness || 3,
          consistency: goals.consistency || 3,
          feel: goals.feel || 3,
          workability: goals.workability || 3,
          launch: goals.launch || 3,
          short_game: goals.short_game || 3,
          putting: goals.putting || 3,
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/7`);
  };

  const onSubmit = async (values: GoalsPriorities) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        goals: values as any,
        current_step: 8,
        status: "completed",
      })
      .eq("id", sessionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save your priorities. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    toast({
      title: "Fitting complete! ✓",
      description: "Generating your personalized recommendations...",
    });

    router.push(`/fitting/${sessionId}/results`);
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
          <ProgressBar currentStep={8} totalSteps={8} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Section 8: Goals & Priorities
              </CardTitle>
              <CardDescription>
                Rate each goal from 1 (not important) to 5 (top priority). This helps us recommend clubs that match your playing style.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-6">
                    {priorityOptions.map((option) => (
                      <FormField
                        key={option.key}
                        control={form.control}
                        name={option.key as keyof GoalsPriorities}
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base font-semibold">
                                  {option.label}
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 min-w-[100px]">
                                <span className="text-sm text-muted-foreground">Priority:</span>
                                <span className="text-lg font-bold text-accent w-4">
                                  {field.value}
                                </span>
                              </div>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={5}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                                className="w-full"
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground px-1">
                              <span>Not important</span>
                              <span>Top priority</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Quick tip:</p>
                    <p className="text-sm text-muted-foreground">
                      Don't worry about making everything a 5! The relative priorities help us understand what matters most to YOU. A mix of ratings gives us the best picture of your needs.
                    </p>
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
                      className="bg-accent hover:bg-accent/90"
                    >
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Complete Fitting
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