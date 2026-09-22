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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { currentBagSchema, type CurrentBag } from "@/lib/wizardValidation";
import { Loader2, ArrowLeft } from "lucide-react";

const fairwayWoodOptions = ["3-wood", "5-wood", "7-wood"];
const hybridOptions = ["2H", "3H", "4H", "5H"];
const ironOptions = ["3-iron", "4-iron", "5-iron", "6-iron", "7-iron", "8-iron", "9-iron"];
const wedgeOptions = ["PW", "GW", "SW", "LW"];

export default function Step3() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFairwayWoods, setSelectedFairwayWoods] = useState<string[]>([]);
  const [selectedHybrids, setSelectedHybrids] = useState<string[]>([]);
  const [selectedIrons, setSelectedIrons] = useState<string[]>([]);
  const [selectedWedges, setSelectedWedges] = useState<string[]>([]);

  const form = useForm<CurrentBag>({
    resolver: zodResolver(currentBagSchema),
    defaultValues: {
      carries_driver: true,
      carries_fairway_woods: [],
      carries_hybrids: [],
      carries_irons: [],
      carries_wedges: [],
      carries_putter: true,
      driver_make: "",
      driver_model: "",
      driver_current_loft: undefined,
      driver_current_flex: undefined,
      current_7iron_carry: 150,
      current_putter_length: undefined,
      current_putter_model: "",
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
        const fairwayWoods = (data.carries_fairway_woods as string[]) || [];
        const hybrids = (data.carries_hybrids as string[]) || [];
        const irons = (data.carries_irons as string[]) || [];
        const wedges = (data.carries_wedges as string[]) || [];

        setSelectedFairwayWoods(fairwayWoods);
        setSelectedHybrids(hybrids);
        setSelectedIrons(irons);
        setSelectedWedges(wedges);

        form.reset({
          carries_driver: data.carries_driver ?? true,
          carries_fairway_woods: fairwayWoods,
          carries_hybrids: hybrids,
          carries_irons: irons,
          carries_wedges: wedges,
          carries_putter: data.carries_putter ?? true,
          driver_make: data.driver_make || "",
          driver_model: data.driver_model || "",
          driver_current_loft: data.driver_current_loft || undefined,
          driver_current_flex: (data.driver_current_flex as any) || undefined,
          current_7iron_carry: data.current_7iron_carry || 150,
          current_putter_length: data.current_putter_length || undefined,
          current_putter_model: data.current_putter_model || "",
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [id, user, form]);

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const handleBack = () => {
    const sessionId = Array.isArray(id) ? id[0] : id;
    router.push(`/fitting/${sessionId}/step/2`);
  };

  const onSubmit = async (values: CurrentBag) => {
    if (!user || !id) return;

    const sessionId = Array.isArray(id) ? id[0] : id;
    setIsSaving(true);

    const { error } = await supabase
      .from("fitting_sessions")
      .update({
        carries_driver: values.carries_driver,
        carries_fairway_woods: selectedFairwayWoods,
        carries_hybrids: selectedHybrids,
        carries_irons: selectedIrons,
        carries_wedges: selectedWedges,
        carries_putter: values.carries_putter,
        driver_make: values.driver_make || null,
        driver_model: values.driver_model || null,
        driver_current_loft: values.driver_current_loft || null,
        driver_current_flex: values.driver_current_flex || null,
        current_7iron_carry: values.current_7iron_carry,
        current_putter_length: values.current_putter_length || null,
        current_putter_model: values.current_putter_model || null,
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
      title: "Progress saved ✓",
      description: "Moving to swing characteristics...",
    });

    router.push(`/fitting/${sessionId}/step/4`);
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
          <ProgressBar currentStep={3} totalSteps={8} />

          <Card>
            <CardHeader>
              <CardTitle>Section 3: Current Bag & Equipment</CardTitle>
              <CardDescription>Tell us about your current clubs (all optional except 7-iron carry)</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="carries_driver"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I carry a driver</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("carries_driver") && (
                      <div className="ml-6 space-y-4 border-l-2 border-muted pl-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="driver_make"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Driver Make</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Titleist" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="driver_model"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Driver Model</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="TSi3" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="driver_current_loft"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Loft (degrees)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    min={7}
                                    max={15}
                                    step={0.5}
                                    placeholder="10.5"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="driver_current_flex"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shaft Flex</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select flex" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ladies">Ladies</SelectItem>
                                    <SelectItem value="senior">Senior</SelectItem>
                                    <SelectItem value="regular">Regular</SelectItem>
                                    <SelectItem value="stiff">Stiff</SelectItem>
                                    <SelectItem value="x-stiff">X-Stiff</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Fairway Woods I Carry</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {fairwayWoodOptions.map((wood) => (
                        <div key={wood} className="flex items-center space-x-2">
                          <Checkbox
                            id={`fw-${wood}`}
                            checked={selectedFairwayWoods.includes(wood)}
                            onCheckedChange={() => {
                              toggleArrayItem(selectedFairwayWoods, wood, setSelectedFairwayWoods);
                              form.setValue("carries_fairway_woods", 
                                selectedFairwayWoods.includes(wood) 
                                  ? selectedFairwayWoods.filter(w => w !== wood)
                                  : [...selectedFairwayWoods, wood]
                              );
                            }}
                          />
                          <label htmlFor={`fw-${wood}`} className="text-sm font-medium cursor-pointer">
                            {wood}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Hybrids I Carry</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {hybridOptions.map((hybrid) => (
                        <div key={hybrid} className="flex items-center space-x-2">
                          <Checkbox
                            id={`h-${hybrid}`}
                            checked={selectedHybrids.includes(hybrid)}
                            onCheckedChange={() => {
                              toggleArrayItem(selectedHybrids, hybrid, setSelectedHybrids);
                              form.setValue("carries_hybrids",
                                selectedHybrids.includes(hybrid)
                                  ? selectedHybrids.filter(h => h !== hybrid)
                                  : [...selectedHybrids, hybrid]
                              );
                            }}
                          />
                          <label htmlFor={`h-${hybrid}`} className="text-sm font-medium cursor-pointer">
                            {hybrid}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Irons I Carry</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {ironOptions.map((iron) => (
                        <div key={iron} className="flex items-center space-x-2">
                          <Checkbox
                            id={`i-${iron}`}
                            checked={selectedIrons.includes(iron)}
                            onCheckedChange={() => {
                              toggleArrayItem(selectedIrons, iron, setSelectedIrons);
                              form.setValue("carries_irons",
                                selectedIrons.includes(iron)
                                  ? selectedIrons.filter(i => i !== iron)
                                  : [...selectedIrons, iron]
                              );
                            }}
                          />
                          <label htmlFor={`i-${iron}`} className="text-sm font-medium cursor-pointer">
                            {iron}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Wedges I Carry</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {wedgeOptions.map((wedge) => (
                        <div key={wedge} className="flex items-center space-x-2">
                          <Checkbox
                            id={`w-${wedge}`}
                            checked={selectedWedges.includes(wedge)}
                            onCheckedChange={() => {
                              toggleArrayItem(selectedWedges, wedge, setSelectedWedges);
                              form.setValue("carries_wedges",
                                selectedWedges.includes(wedge)
                                  ? selectedWedges.filter(w => w !== wedge)
                                  : [...selectedWedges, wedge]
                              );
                            }}
                          />
                          <label htmlFor={`w-${wedge}`} className="text-sm font-medium cursor-pointer">
                            {wedge}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="current_7iron_carry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current 7-Iron Carry Distance (yards) <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            min={50}
                            max={250}
                            placeholder="150"
                          />
                        </FormControl>
                        <FormDescription>Your typical carry distance with a 7-iron</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="carries_putter"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I carry a putter</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("carries_putter") && (
                      <div className="ml-6 space-y-4 border-l-2 border-muted pl-4">
                        <FormField
                          control={form.control}
                          name="current_putter_model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Putter Model</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Scotty Cameron Newport" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="current_putter_length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Putter Length (inches)</FormLabel>
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
                      </div>
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