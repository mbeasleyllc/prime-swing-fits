import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, Printer, ArrowLeft, Play, TrendingUp } from "lucide-react";

export default function FittingResults() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [swingProfile, setSwingProfile] = useState<any>(null);
  const [courseConditions, setCourseConditions] = useState<any>(null);
  const [physicalProfile, setPhysicalProfile] = useState<any>(null);
  const [currentEquipment, setCurrentEquipment] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!id || !user) return;

    const loadResults = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;

      const [recRes, playerRes, swingRes, courseRes, physicalRes, equipmentRes, sessionRes] = await Promise.all([
        supabase.from("fitting_recommendations").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("player_profile").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("swing_profile").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("course_conditions").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("physical_profile").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("current_equipment").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("fitting_sessions").select("*").eq("id", sessionId).single(),
      ]);

      if (recRes.data) setRecommendations(recRes.data);
      if (playerRes.data) setPlayerProfile(playerRes.data);
      if (swingRes.data) setSwingProfile(swingRes.data);
      if (courseRes.data) setCourseConditions(courseRes.data);
      if (physicalRes.data) setPhysicalProfile(physicalRes.data);
      if (equipmentRes.data) setCurrentEquipment(equipmentRes.data);
      if (sessionRes.data) setSession(sessionRes.data);

      if (recRes.data) {
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .or(`flex_category.eq.${recRes.data.shaft_flex_rec},grip_size.eq.${recRes.data.grip_size_rec}`)
          .limit(3);
        
        if (productsData) setProducts(productsData);
      }

      setIsLoading(false);
    };

    loadResults();
  }, [id, user]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Skeleton className="h-12 w-3/4 mb-8" />
            <Skeleton className="h-64 mb-6" />
            <Skeleton className="h-48 mb-6" />
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!recommendations) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No recommendations found for this session.</p>
              </CardContent>
            </Card>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const needsProfessionalFitting =
    physicalProfile?.mobility_limit === "severe" ||
    physicalProfile?.mobility_limit === "moderate" ||
    currentEquipment?.satisfaction <= 2;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Your ProSwing Fitting Results</h1>
            <p className="text-muted-foreground">
              {playerProfile?.full_name} • {session?.completed_at ? new Date(session.completed_at).toLocaleDateString() : ""}
            </p>
          </div>

          <Card className="mb-6 border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-accent">Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Club Length</p>
                  <p className="text-lg font-semibold">{recommendations.club_length_adj}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lie Angle</p>
                  <p className="text-lg font-semibold">{recommendations.lie_angle_adj}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grip Size</p>
                  <p className="text-lg font-semibold capitalize">{recommendations.grip_size_rec}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shaft Flex</p>
                  <p className="text-lg font-semibold">{recommendations.shaft_flex_rec}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shaft Weight</p>
                  <p className="text-lg font-semibold">{recommendations.shaft_weight}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Club Type</p>
                  <p className="text-lg font-semibold capitalize">{recommendations.club_type_rec}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Predictions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Performance Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Predicted Distance Gain</p>
                <p className="font-semibold text-blue-900">{recommendations.predicted_driver_gain}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Predicted Accuracy Improvement</p>
                <p className="font-semibold text-blue-900">{recommendations.predicted_accuracy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Predicted Consistency Improvement</p>
                <p className="font-semibold text-blue-900">{recommendations.predicted_consistency}</p>
              </div>
              <p className="text-xs text-muted-foreground italic mt-4">
                Note: These are estimates based on your input profile. Actual results depend on swing changes and club build quality.
              </p>
            </CardContent>
          </Card>

          {/* Gapping Analysis - Core and above only */}
          {(playerProfile?.budget_range === "mid_range" || playerProfile?.budget_range === "premium") && (
            <Card>
              <CardHeader>
                <CardTitle>Gapping Analysis & Bag Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.gaps_identified && recommendations.gaps_identified.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Gaps Identified:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {recommendations.gaps_identified.map((gap: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recommendations.redundancies && recommendations.redundancies.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Redundancies:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {recommendations.redundancies.map((red: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">{red}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2">Recommended Bag Configuration:</h4>
                  <p className="text-sm bg-accent/10 p-3 rounded">{recommendations.recommended_bag}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confidence Scores - Premium only */}
          {playerProfile?.budget_range === "premium" && (
            <Card>
              <CardHeader>
                <CardTitle>Fit Confidence Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Driver Fit Confidence</span>
                    <span className="text-sm font-medium">{recommendations.driver_confidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${recommendations.driver_confidence}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Irons Fit Confidence</span>
                    <span className="text-sm font-medium">{recommendations.irons_confidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${recommendations.irons_confidence}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Wedges Fit Confidence</span>
                    <span className="text-sm font-medium">{recommendations.wedge_confidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${recommendations.wedge_confidence}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Putter Fit Confidence</span>
                    <span className="text-sm font-medium">{recommendations.putter_confidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${recommendations.putter_confidence}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Bag Breakdown - Core and above */}
          {(playerProfile?.budget_range === "mid_range" || playerProfile?.budget_range === "premium") && (
            <Card>
              <CardHeader>
                <CardTitle>Complete Bag Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Driver</h4>
                  <p className="text-sm text-muted-foreground">{recommendations.driver_spec}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Fairway Woods</h4>
                  <p className="text-sm text-muted-foreground">{recommendations.fairway_woods}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Hybrids</h4>
                  <p className="text-sm text-muted-foreground">{recommendations.hybrids}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Irons</h4>
                  <p className="text-sm text-muted-foreground">{recommendations.irons_spec}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Wedges</h4>
                  <p className="text-sm text-muted-foreground">{recommendations.wedges_spec}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Putter</h4>
                  <p className="text-sm text-muted-foreground">{recommendations.putter_spec}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {recommendations.advisory_notes && (
            <Card className="mb-6 border-amber-500/30 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="h-5 w-5" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-amber-900/90">
                  {recommendations.advisory_notes.split("\n\n").map((note: string, index: number) => (
                    <p key={index} className="text-sm leading-relaxed">{note}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {needsProfessionalFitting && (
            <Card className="mb-6 border-yellow-500 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-900">
                    <strong>⚠️ Professional Fitting Recommended:</strong> Based on your profile, we recommend consulting
                    a certified professional club fitter for a hands-on fitting session before purchasing.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Matched Products */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recommended Products for Your Profile</h2>
            {products.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Product recommendations will be updated soon. Contact us for personalized suggestions.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      {product.image_url && (
                        <div className="aspect-square bg-muted rounded mb-4 flex items-center justify-center">
                          <img src={product.image_url} alt={product.model_name} className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                      <Badge className="mb-2 bg-accent text-accent-foreground">Best Match for Your Profile</Badge>
                      <h3 className="font-bold text-lg mb-1">{product.brand}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.model_name}</p>
                      <p className="text-sm mb-1">Flex: {product.flex_category}</p>
                      <p className="text-2xl font-bold text-accent mb-4">${product.price_usd}</p>
                      {product.affiliate_url && (
                        <Button className="w-full" asChild>
                          <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
                            Buy Now →
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Fitting Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="player">
                  <AccordionTrigger>Player Profile</AccordionTrigger>
                  <AccordionContent>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div><dt className="text-muted-foreground">Full Name</dt><dd className="font-medium">{playerProfile?.full_name}</dd></div>
                      <div><dt className="text-muted-foreground">Age</dt><dd className="font-medium">{playerProfile?.age}</dd></div>
                      <div><dt className="text-muted-foreground">Dominant Hand</dt><dd className="font-medium capitalize">{playerProfile?.dominant_hand}</dd></div>
                      <div><dt className="text-muted-foreground">Experience</dt><dd className="font-medium capitalize">{playerProfile?.experience}</dd></div>
                      <div><dt className="text-muted-foreground">Handicap</dt><dd className="font-medium">{playerProfile?.handicap}</dd></div>
                      <div><dt className="text-muted-foreground">Primary Goal</dt><dd className="font-medium capitalize">{playerProfile?.primary_goal?.replace("_", " ")}</dd></div>
                    </dl>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="swing">
                  <AccordionTrigger>Swing Profile</AccordionTrigger>
                  <AccordionContent>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div><dt className="text-muted-foreground">Typical Shot</dt><dd className="font-medium capitalize">{swingProfile?.typical_shot}</dd></div>
                      <div><dt className="text-muted-foreground">Miss Tendency</dt><dd className="font-medium capitalize">{swingProfile?.miss_tendency}</dd></div>
                      <div><dt className="text-muted-foreground">Ball Flight</dt><dd className="font-medium capitalize">{swingProfile?.ball_flight}</dd></div>
                      <div><dt className="text-muted-foreground">Swing Tempo</dt><dd className="font-medium capitalize">{swingProfile?.swing_tempo}</dd></div>
                      <div><dt className="text-muted-foreground">Swing Strength</dt><dd className="font-medium capitalize">{swingProfile?.swing_strength}</dd></div>
                    </dl>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="physical">
                  <AccordionTrigger>Physical Measurements</AccordionTrigger>
                  <AccordionContent>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div><dt className="text-muted-foreground">Height</dt><dd className="font-medium">{physicalProfile?.height_ft}'{physicalProfile?.height_in}"</dd></div>
                      <div><dt className="text-muted-foreground">Wrist-to-Floor</dt><dd className="font-medium">{physicalProfile?.wrist_to_floor}" </dd></div>
                      <div><dt className="text-muted-foreground">Hand Size</dt><dd className="font-medium capitalize">{physicalProfile?.hand_size?.replace("_", " ")}</dd></div>
                      <div><dt className="text-muted-foreground">Mobility</dt><dd className="font-medium capitalize">{physicalProfile?.mobility_limit}</dd></div>
                    </dl>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="equipment">
                  <AccordionTrigger>Current Equipment</AccordionTrigger>
                  <AccordionContent>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div><dt className="text-muted-foreground">Brand</dt><dd className="font-medium">{currentEquipment?.club_brand || "Not specified"}</dd></div>
                      <div><dt className="text-muted-foreground">Length</dt><dd className="font-medium capitalize">{currentEquipment?.club_length}</dd></div>
                      <div><dt className="text-muted-foreground">Shaft Flex</dt><dd className="font-medium">{currentEquipment?.shaft_flex}</dd></div>
                      <div><dt className="text-muted-foreground">Grip Size</dt><dd className="font-medium capitalize">{currentEquipment?.grip_size}</dd></div>
                      <div><dt className="text-muted-foreground">Satisfaction</dt><dd className="font-medium">{currentEquipment?.satisfaction}/5</dd></div>
                    </dl>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="course">
                  <AccordionTrigger>Course Conditions</AccordionTrigger>
                  <AccordionContent>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div><dt className="text-muted-foreground">Turf Type</dt><dd className="font-medium capitalize">{courseConditions?.turf_type}</dd></div>
                      <div><dt className="text-muted-foreground">Weather</dt><dd className="font-medium capitalize">{courseConditions?.typical_weather}</dd></div>
                      <div><dt className="text-muted-foreground">Ball Type</dt><dd className="font-medium capitalize">{courseConditions?.ball_used}</dd></div>
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/fitting/${id}/report`}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF Report
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
            <Button variant="outline" asChild>
              <Link href="/fitting/new">
                <Play className="h-4 w-4 mr-2" />
                Start New Fitting
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}