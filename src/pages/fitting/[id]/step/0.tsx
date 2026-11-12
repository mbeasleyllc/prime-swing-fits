import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Grip, Users, ShoppingCart, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { useToast } from "@/hooks/use-toast";

type ClubCategory = {
  id: string;
  label: string;
  description: string;
  icon: string;
  popular?: boolean;
};

const CLUB_CATEGORIES: ClubCategory[] = [
  {
    id: "driver",
    label: "Driver",
    description: "Distance, launch angle, spin rate, shaft selection",
    icon: "🏌️",
    popular: true
  },
  {
    id: "fairway_woods",
    label: "Fairway Woods",
    description: "3W, 5W, 7W - gapping, launch, versatility",
    icon: "⛳"
  },
  {
    id: "hybrids",
    label: "Hybrids",
    description: "Long iron replacement, distance gaps, forgiveness",
    icon: "🎯",
    popular: true
  },
  {
    id: "irons",
    label: "Irons",
    description: "Set selection, lie angle, shaft, length, loft gapping",
    icon: "🔧",
    popular: true
  },
  {
    id: "wedges",
    label: "Wedges",
    description: "Loft selection, bounce, grind, spin characteristics",
    icon: "⚡"
  },
  {
    id: "putter",
    label: "Putter",
    description: "Head style, length, lie, toe hang, alignment aids",
    icon: "🎱",
    popular: true
  },
  {
    id: "golf_ball",
    label: "Golf Ball",
    description: "Compression, spin, feel, performance matching",
    icon: "⚪",
    popular: true
  }
];

const SUBSCRIPTION_TIERS = {
  free_trial: {
    name: "Free Trial",
    limit: 1,
    description: "1 complimentary club category fitting"
  },
  single_club_starter: {
    name: "Single Club Starter",
    limit: 1,
    description: "$29.99 - 1 club + add-ons at $9.99 each",
    addOnPrice: 9.99
  },
  full_bag_premium: {
    name: "Full Bag Premium",
    limit: 14,
    description: "$49.99 - Up to 14 clubs"
  },
  full_bag_executive: {
    name: "Full Bag Executive",
    limit: 999,
    description: "$64.99 - Unlimited clubs + re-evaluations"
  }
};

export default function Step0() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free_trial");
  const [existingData, setExistingData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadExistingData();
    }
  }, [id]);

  const loadExistingData = async () => {
    try {
      const sessionId = Array.isArray(id) ? id[0] : id;
      
      const { data: session, error } = await supabase
        .from("fitting_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;

      setExistingData(session);
      setSubscriptionTier(session.subscription_tier || "free_trial");
      
      if (session.selected_categories && Array.isArray(session.selected_categories)) {
        setSelectedCategories(session.selected_categories as string[]);
      }
    } catch (error) {
      console.error("Error loading session:", error);
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const tierLimit = SUBSCRIPTION_TIERS[subscriptionTier as keyof typeof SUBSCRIPTION_TIERS]?.limit || 1;
    
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
    } else {
      if (selectedCategories.length >= tierLimit) {
        toast({
          title: "Category Limit Reached",
          description: `Your ${SUBSCRIPTION_TIERS[subscriptionTier as keyof typeof SUBSCRIPTION_TIERS]?.name} plan allows ${tierLimit} ${tierLimit === 1 ? 'category' : 'categories'}. Upgrade to fit more clubs.`,
          variant: "destructive"
        });
        return;
      }
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleNext = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one club category to continue",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const sessionId = Array.isArray(id) ? id[0] : id;
      
      const { error } = await supabase
        .from("fitting_sessions")
        .update({
          selected_categories: selectedCategories,
          subscription_tier: subscriptionTier,
          clubs_fitted_count: selectedCategories.length,
          uses_category_selection: true,
          step_0_data: {
            selected_categories: selectedCategories,
            selected_at: new Date().toISOString()
          }
        })
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Categories Saved",
        description: `${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'} selected`,
      });

      router.push(`/fitting/${sessionId}/step/1`);
    } catch (error) {
      console.error("Error saving categories:", error);
      toast({
        title: "Error",
        description: "Failed to save category selection",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fitting session...</p>
        </div>
      </div>
    );
  }

  const tierInfo = SUBSCRIPTION_TIERS[subscriptionTier as keyof typeof SUBSCRIPTION_TIERS];
  const canSelectMore = selectedCategories.length < (tierInfo?.limit || 1);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <ProgressBar currentStep={0} totalSteps={9} />

        <div className="mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Select Club Categories
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose which clubs you'd like to get fitted for
            </p>
          </div>

          {/* Subscription Tier Badge */}
          <Card className="mb-6 border-accent/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-accent text-white">
                  {tierInfo?.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {tierInfo?.description}
                </span>
              </div>
              <div className="text-sm font-medium">
                {selectedCategories.length} / {tierInfo?.limit === 999 ? '∞' : tierInfo?.limit} selected
              </div>
            </CardContent>
          </Card>

          {/* Category Selection Grid */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {CLUB_CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              const isDisabled = !isSelected && !canSelectMore;

              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected 
                      ? 'border-accent border-2 bg-accent/5' 
                      : isDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-accent/50'
                  }`}
                  onClick={() => !isDisabled && handleCategoryToggle(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{category.icon}</div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {category.label}
                            {category.popular && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="mt-1"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Alert */}
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Each category includes a tailored questionnaire to capture specific fitting requirements.
              You'll only answer questions relevant to the clubs you've selected.
            </AlertDescription>
          </Alert>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={saving || selectedCategories.length === 0}
              className="bg-accent hover:bg-accent/90"
            >
              {saving ? "Saving..." : "Continue to Player Profile"}
            </Button>
          </div>

          {/* Upgrade CTA */}
          {!canSelectMore && subscriptionTier !== "full_bag_executive" && (
            <div className="mt-6">
              <Card className="border-accent/30 bg-accent/5">
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-accent" />
                  <h3 className="text-lg font-semibold mb-2">Want to fit more clubs?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upgrade your plan to unlock additional club categories
                  </p>
                  <Button
                    variant="default"
                    className="bg-accent hover:bg-accent/90"
                    onClick={() => router.push("/pricing")}
                  >
                    View Pricing Plans
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}