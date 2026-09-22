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
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ironWedgeFittingSchema, type IronWedgeFitting } from "@/lib/wizardValidation";
import { Loader2, ArrowLeft } from "lucide-react";

export default function Step6() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedWedgePainPoints, setSelectedWedgePainPoints] = useState<string[]>([]);

  const form = useForm<IronWedgeFitting>({
    resolver: zodResolver(ironWedgeFittingSchema),
    defaultValues: {
      iron_7_carry: undefined,
      iron_7_flight: undefined,
      choke_down_frequency: "never",
      iron_current_length: "standard",
      iron_common_miss: undefined,
      wedge_current_challenge: [],
      wedge_common_miss: undefined,
      pw_loft: undefined,
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
        const painPoints = (data.wedge_current_challenge as string[]) || [];
        setSelectedWedgePainPoints(painPoints);

        form.reset({
          iron_7_carry: data.iron_7_carry || undefined,
          iron_7_flight: (data.iron_7_flight as any) || undefined,
          choke_down_frequency: (data.choke_down_frequency as any) || "never",
          iron_current_length: (data.iron_current_length as any) || "standard",
          iron_common_miss: (data.iron_common_miss as any) || undefined,
          wedge_current_challenge: painPoints,
          wedge_common_miss: (data.wedge_common_miss as any) || undefined,
          pw_loft: data.pw_loft || undefined,
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const toggleWedgePainPoint = (point: string) => {
    const newSelection = selectedWedgePainPoints.includes(point)
      ? selectedWedgePainPoints.filter(p => p !== point)
      : [...selectedWedgePainPoints, point];
    setSelectedWedgePainPoints(newSelection);
    form.setValue("wedge_current_challenge", newSelection);
  };

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/5`);
  };

  const onSubmit = async (values: IronWedgeFitting) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        iron_7_carry: values.iron_7_carry || null,
        iron_7_flight: values.iron_7_flight || null,
        choke_down_frequency: values.choke_down_frequency,
        iron_current_length: values.iron_current_length,
        iron_common_miss: values.iron_common_miss || null,
        wedge_current_challenge: selectedWedgePainPoints,
        wedge_common_miss: values.wedge_common_miss || null,
        pw_loft: values.pw_loft || null,
        current_step: 7,
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
      description: "Moving to putter fitting...",
    });

    router.push(`/fitting/${sessionId}/step/7`);
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
          <ProgressBar currentStep={6} totalSteps={8} />

          <Card>
            <CardHeader>
              <CardTitle>Section 6: Iron & Wedge Fitting</CardTitle>
              <CardDescription>Optimize your scoring clubs</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Iron Characteristics</h3>
                    
                    <FormField
                      control={form.control}
                      name="iron_7_carry"
                      render={({ field }) => (
                        <FormItem>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="iron_7_flight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typical 7-Iron Flight</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select flight" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="too_low">Too Low</SelectItem>
                              <SelectItem value="ideal">Ideal</SelectItem>
                              <SelectItem value="too_high">Too High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="choke_down_frequency"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>Choke Down Habit <span className="text-destructive">*</span></FormLabel>
                              <MeasurementTooltip type="choke-down" />
                            </div>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="sometimes">Sometimes</SelectItem>
                                <SelectItem value="often">Often</SelectItem>
                                <SelectItem value="always">Always</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="iron_current_length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Iron Length <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select length" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="shorter">Shorter than standard</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="longer">Longer than standard</SelectItem>
                                <SelectItem value="unsure">Unsure</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="iron_common_miss"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Iron Miss Tendency</FormLabel>
                            <MeasurementTooltip type="strike-pattern" />
                          </div>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select miss tendency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="slice">Slice</SelectItem>
                              <SelectItem value="push">Push</SelectItem>
                              <SelectItem value="fade">Fade</SelectItem>
                              <SelectItem value="pull">Pull</SelectItem>
                              <SelectItem value="hook">Hook</SelectItem>
                              <SelectItem value="thin">Thin (low contact)</SelectItem>
                              <SelectItem value="fat">Fat (heavy contact)</SelectItem>
                              <SelectItem value="toe">Toe strikes</SelectItem>
                              <SelectItem value="heel">Heel strikes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-sm">Wedge Play</h3>
                    
                    <div className="space-y-2">
                      <FormLabel>Wedge Pain Points</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {["Distance control", "Spin", "Turf contact", "Bunker play"].map((point) => (
                          <div key={point} className="flex items-center space-x-2">
                            <Checkbox
                              id={`wedge-${point}`}
                              checked={selectedWedgePainPoints.includes(point)}
                              onCheckedChange={() => toggleWedgePainPoint(point)}
                            />
                            <label htmlFor={`wedge-${point}`} className="text-sm font-medium cursor-pointer">
                              {point}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="wedge_common_miss"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typical Wedge Miss</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select miss" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="thin">Thin</SelectItem>
                              <SelectItem value="fat">Fat</SelectItem>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                              <SelectItem value="short">Short</SelectItem>
                              <SelectItem value="long">Long</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pw_loft"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pitching Wedge Loft (degrees)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              min={42}
                              max={50}
                              step={1}
                              placeholder="46"
                            />
                          </FormControl>
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
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}