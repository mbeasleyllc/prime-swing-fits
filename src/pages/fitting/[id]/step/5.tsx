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
import { longGameSchema, type LongGame } from "@/lib/wizardValidation";
import { Loader2, ArrowLeft } from "lucide-react";

const troubleClubOptions = ["3-wood", "5-wood", "7-wood", "2H", "3H", "4H", "5H", "Long irons"];

export default function Step5() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTroubleClubs, setSelectedTroubleClubs] = useState<string[]>([]);

  const form = useForm<LongGame>({
    resolver: zodResolver(longGameSchema),
    defaultValues: {
      carry_driver: undefined,
      carry_3wood: undefined,
      carry_5wood: undefined,
      carry_4iron: undefined,
      carry_5iron: undefined,
      long_iron_trouble_club: [],
      long_iron_miss_type: undefined,
      hybrid_desired_flight: undefined,
      hybrid_primary_use: undefined,
      driver_head_shape_pref: undefined,
      driver_face_pref: undefined,
      driver_sound_pref: undefined,
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
        const troubleClubs = Array.isArray(data.long_iron_trouble_club) 
          ? data.long_iron_trouble_club as string[]
          : [];
        setSelectedTroubleClubs(troubleClubs);

        form.reset({
          carry_driver: data.driver_avg_carry || undefined,
          carry_3wood: data.carry_3wood || undefined,
          carry_5wood: data.carry_5wood || undefined,
          carry_4iron: data.carry_4iron || undefined,
          carry_5iron: data.carry_5iron || undefined,
          long_iron_trouble_club: troubleClubs,
          long_iron_miss_type: (data.long_iron_miss_type as any) || undefined,
          hybrid_desired_flight: (data.hybrid_desired_flight as any) || undefined,
          hybrid_primary_use: (data.hybrid_primary_use as any) || undefined,
          driver_head_shape_pref: (data.driver_head_shape_pref as any) || undefined,
          driver_face_pref: (data.driver_face_pref as any) || undefined,
          driver_sound_pref: (data.driver_sound_pref as any) || undefined,
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const toggleTroubleClub = (club: string) => {
    const newSelection = selectedTroubleClubs.includes(club)
      ? selectedTroubleClubs.filter(c => c !== club)
      : [...selectedTroubleClubs, club];
    setSelectedTroubleClubs(newSelection);
    form.setValue("long_iron_trouble_club", newSelection);
  };

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/4`);
  };

  const onSubmit = async (values: LongGame) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        driver_avg_carry: values.carry_driver || null,
        carry_3wood: values.carry_3wood || null,
        carry_5wood: values.carry_5wood || null,
        carry_4iron: values.carry_4iron || null,
        carry_5iron: values.carry_5iron || null,
        long_iron_trouble_club: selectedTroubleClubs as any,
        long_iron_miss_type: values.long_iron_miss_type || null,
        hybrid_desired_flight: values.hybrid_desired_flight || null,
        hybrid_primary_use: values.hybrid_primary_use || null,
        driver_head_shape_pref: values.driver_head_shape_pref || null,
        driver_face_pref: values.driver_face_pref || null,
        driver_sound_pref: values.driver_sound_pref || null,
        current_step: 6,
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
      description: "Moving to iron & wedge fitting...",
    });

    router.push(`/fitting/${sessionId}/step/6`);
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
          <ProgressBar currentStep={5} totalSteps={8} />

          <Card>
            <CardHeader>
              <CardTitle>Section 5: Long Game (Driver + Woods/Hybrids)</CardTitle>
              <CardDescription>Help us optimize your long game equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Carry Distances (yards)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="carry_driver"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Driver</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                min={100}
                                max={350}
                                placeholder="240"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="carry_3wood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>3-Wood</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                min={100}
                                max={300}
                                placeholder="220"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="carry_5wood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>5-Wood</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                min={100}
                                max={280}
                                placeholder="200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="carry_4iron"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>4-Iron</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                min={100}
                                max={250}
                                placeholder="190"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="carry_5iron"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>5-Iron</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                min={100}
                                max={230}
                                placeholder="175"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Which long clubs give you the most trouble?</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {troubleClubOptions.map((club) => (
                        <div key={club} className="flex items-center space-x-2">
                          <Checkbox
                            id={`trouble-${club}`}
                            checked={selectedTroubleClubs.includes(club)}
                            onCheckedChange={() => toggleTroubleClub(club)}
                          />
                          <label htmlFor={`trouble-${club}`} className="text-sm font-medium cursor-pointer">
                            {club}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="long_iron_miss_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biggest miss with long irons/hybrids</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select miss type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="slice">Slice</SelectItem>
                            <SelectItem value="hook">Hook</SelectItem>
                            <SelectItem value="thin">Thin</SelectItem>
                            <SelectItem value="fat">Fat</SelectItem>
                            <SelectItem value="inconsistent_distance">Inconsistent Distance</SelectItem>
                            <SelectItem value="low_flight">Too Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hybrid_desired_flight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Hybrid Ball Flight</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select flight" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="mid">Mid</SelectItem>
                              <SelectItem value="penetrating">Penetrating</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hybrid_primary_use"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Hybrid Use</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select use" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tee">Tee shots</SelectItem>
                              <SelectItem value="approach">Approach shots</SelectItem>
                              <SelectItem value="rough">Rough recovery</SelectItem>
                              <SelectItem value="utility">Utility / All-around</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-sm">Driver Preferences</h3>
                    
                    <FormField
                      control={form.control}
                      name="driver_head_shape_pref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Head Shape</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="traditional">Traditional (pear)</SelectItem>
                              <SelectItem value="modern">Modern (rounded)</SelectItem>
                              <SelectItem value="square">Square/aggressive</SelectItem>
                              <SelectItem value="no_preference">No preference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="driver_face_pref"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Face Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="square">Square</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                <SelectItem value="no_preference">No preference</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="driver_sound_pref"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sound Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="loud">Loud/explosive</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="muted">Muted/quiet</SelectItem>
                                <SelectItem value="no_preference">No preference</SelectItem>
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