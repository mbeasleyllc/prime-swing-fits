import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/integrations/supabase/client";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, Printer, ArrowLeft, Play, Target, TrendingUp, Mail, Loader2, Plus } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface CategoryRecommendation {
  category: string;
  club_length?: string;
  lie_angle?: string;
  shaft_flex?: string;
  shaft_weight?: string;
  grip_size?: string;
  head_style?: string;
  lofts?: string;
  specifications?: Record<string, any>;
  explanation?: string;
  confidence_score?: number;
}

interface GolfBallRecommendation {
  name: string;
  compression: number;
  spinRate: string;
  optimalSpeed: string;
  matchScore: number;
}

interface SessionData {
  id: string;
  user_id: string;
  player_name?: string;
  updated_at?: string;
  selected_categories?: string[];
  subscription_tier?: string;
}

const CATEGORY_CONFIG = {
  driver: {
    key: "driver",
    label: "Driver",
    description: "Your driver specifications"
  },
  fairway_woods: {
    key: "fairway_woods",
    label: "Fairway Woods",
    description: "3W, 5W, 7W specifications"
  },
  hybrids: {
    key: "hybrids",
    label: "Hybrids",
    description: "Hybrid club specifications"
  },
  irons: {
    key: "irons",
    label: "Irons",
    description: "Iron set specifications"
  },
  wedges: {
    key: "wedges",
    label: "Wedges",
    description: "Wedge specifications"
  },
  putter: {
    key: "putter",
    label: "Putter",
    description: "Putter specifications"
  },
  golf_ball: {
    key: "golf_ball",
    label: "Golf Balls",
    description: "Recommended golf balls"
  }
};

export default function FittingResults() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, CategoryRecommendation>>({});
  const [golfBalls, setGolfBalls] = useState<GolfBallRecommendation[]>([]);
  const [matchedProducts, setMatchedProducts] = useState<Record<string, any[]>>({});
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!id || !user) return;

    const loadResults = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;

      // Fetch session data
      const { data: sessionData } = await supabase
        .from("fitting_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (sessionData) {
        const categories = (sessionData.selected_categories as string[]) || [];
        setSession(sessionData as SessionData);
        setSelectedCategories(categories);
        
        // Fetch recommendations from fitting_recommendations_v2 (category-specific)
        const { data: recommendationsData } = await supabase
          .from("fitting_recommendations_v2")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: false });

        if (recommendationsData && recommendationsData.length > 0) {
          // Group by category
          const recsByCategory: Record<string, CategoryRecommendation> = {};
          const ballRecs: GolfBallRecommendation[] = [];

          recommendationsData.forEach(rec => {
            const recsData = rec.recommendations as any;
            
            if (rec.category === "golf_ball" && recsData?.balls) {
              // Extract golf balls from recommendations
              if (Array.isArray(recsData.balls)) {
                ballRecs.push(...recsData.balls);
              }
            } else if (recsData) {
              // Extract club recommendations
              recsByCategory[rec.category] = {
                category: rec.category,
                club_length: recsData.club_length || undefined,
                lie_angle: recsData.lie_angle || undefined,
                shaft_flex: recsData.shaft_flex || undefined,
                shaft_weight: recsData.shaft_weight || undefined,
                grip_size: recsData.grip_size || undefined,
                head_style: recsData.head_style || undefined,
                lofts: recsData.lofts || undefined,
                specifications: recsData.specifications || undefined,
                explanation: recsData.explanation || undefined,
                confidence_score: rec.confidence_score || undefined
              };
            }
          });
          
          setRecommendations(recsByCategory);
          setGolfBalls(ballRecs);

          // Match products for each category
          matchProductsByCategory(recsByCategory);
        }
      }

      setIsLoading(false);
    };

    loadResults();
  }, [id, user]);

  const matchProductsByCategory = (recs: Record<string, CategoryRecommendation>) => {
    const matched: Record<string, any[]> = {};

    Object.keys(recs).forEach(category => {
      // Products will be matched via API in future
      // For now, return empty array
      matched[category] = [];
    });

    setMatchedProducts(matched);
  };

  const handleEmailReport = async () => {
    if (!user || !session) return;

    setIsSendingEmail(true);

    try {
      const reportElement = document.getElementById("fitting-report");
      if (!reportElement) {
        throw new Error("Report element not found");
      }

      toast({
        title: "Preparing email...",
        description: "Generating your PDF report",
      });

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      const response = await fetch('/api/send-fitting-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email!,
          userName: session.player_name || user.email!.split("@")[0],
          sessionId: session.id,
          pdfBase64,
          recommendations: recommendations || {},
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Email sent! ✓",
          description: `Your fitting report has been sent to ${user.email}`,
        });
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Email error:", error);
      toast({
        title: "Email failed",
        description: "Could not send report. Please try downloading the PDF instead.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const renderCategoryCard = (
    categoryKey: string,
    icon: React.ReactNode
  ) => {
    const rec = recommendations[categoryKey];
    const products = matchedProducts[categoryKey] || [];
    const config = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
    
    if (!rec || !config) return null;

    return (
      <div className="space-y-6">
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {config.label} Specifications
            </CardTitle>
            {rec.confidence_score && (
              <CardDescription>
                Confidence Score: {rec.confidence_score}%
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {rec.club_length && (
                <div>
                  <p className="text-sm text-muted-foreground">Length</p>
                  <p className="font-semibold">{rec.club_length}</p>
                </div>
              )}
              {rec.lie_angle && (
                <div>
                  <p className="text-sm text-muted-foreground">Lie Angle</p>
                  <p className="font-semibold">{rec.lie_angle}</p>
                </div>
              )}
              {rec.shaft_flex && (
                <div>
                  <p className="text-sm text-muted-foreground">Shaft Flex</p>
                  <p className="font-semibold">{rec.shaft_flex}</p>
                </div>
              )}
              {rec.shaft_weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Shaft Weight</p>
                  <p className="font-semibold">{rec.shaft_weight}</p>
                </div>
              )}
              {rec.grip_size && (
                <div>
                  <p className="text-sm text-muted-foreground">Grip Size</p>
                  <p className="font-semibold capitalize">{rec.grip_size}</p>
                </div>
              )}
              {rec.head_style && (
                <div>
                  <p className="text-sm text-muted-foreground">Head Style</p>
                  <p className="font-semibold">{rec.head_style}</p>
                </div>
              )}
              {rec.lofts && (
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm text-muted-foreground">Lofts/Setup</p>
                  <p className="font-semibold">{rec.lofts}</p>
                </div>
              )}
            </div>

            {rec.explanation && (
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Why these specs?</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rec.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended {config.label}</CardTitle>
              <CardDescription>
                Products matching your specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map((product, idx) => (
                  <Card key={idx} className="border-muted hover:border-accent/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="aspect-square bg-muted rounded mb-3 flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.model_name} 
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Target className="w-16 h-16 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">{product.brand}</h4>
                        <p className="text-xs text-muted-foreground">{product.model_name}</p>
                        {product.flex_category && (
                          <p className="text-xs">Flex: {product.flex_category}</p>
                        )}
                        {product.price_usd && (
                          <p className="text-lg font-bold text-accent">${product.price_usd}</p>
                        )}
                        {product.affiliate_url && (
                          <Button size="sm" className="w-full" asChild>
                            <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
                              View Product →
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderGolfBallsTab = () => {
    if (golfBalls.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground py-8">
              No golf ball recommendations available
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Golf Balls</CardTitle>
          <CardDescription>
            Top golf balls matched to your swing profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {golfBalls.map((ball, idx) => {
              const fullBall = GOLF_BALL_DATABASE.find(b => b.name === ball.name);
              return (
                <Card key={idx} className="border-muted hover:border-accent/50 transition-colors">
                  <CardContent className="pt-6">
                    {idx === 0 && (
                      <Badge className="mb-3 bg-gold text-gold-foreground">
                        Best Match
                      </Badge>
                    )}
                    <h4 className="font-bold text-lg mb-1">{ball.name}</h4>
                    {fullBall && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {fullBall.manufacturer}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Match Score:</span>
                        <span className="font-semibold">{ball.matchScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compression:</span>
                        <span className="font-medium">{ball.compression}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Spin Rate:</span>
                        <span className="font-medium">{ball.spinRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Speed:</span>
                        <span className="font-medium">{ball.optimalSpeed}</span>
                      </div>
                    </div>

                    {fullBall && (
                      <>
                        <div className="mb-4">
                          <p className="text-xs font-semibold mb-2">Performance:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Distance</span>
                                <span>{fullBall.distance}/10</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div className="bg-accent h-1.5 rounded-full" style={{ width: `${fullBall.distance * 10}%` }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Spin</span>
                                <span>{fullBall.spin}/10</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div className="bg-accent h-1.5 rounded-full" style={{ width: `${fullBall.spin * 10}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs font-semibold mb-1">Best For:</p>
                          <div className="flex flex-wrap gap-1">
                            {fullBall.best_for.slice(0, 2).map((feature, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <span className="text-lg font-bold text-accent">
                            ${fullBall.price_per_dozen}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Skeleton className="h-12 w-3/4 mb-8" />
            <Skeleton className="h-64 mb-6" />
            <Skeleton className="h-48 mb-6" />
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (selectedCategories.length === 0 || Object.keys(recommendations).length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No recommendations found. Please complete the fitting wizard first.
                </p>
                <Button asChild>
                  <Link href="/fitting/new">
                    <Play className="mr-2 h-4 w-4" />
                    Start New Fitting
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  // Build tabs only for selected categories
  const availableTabs = selectedCategories
    .filter(cat => CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG])
    .map(cat => ({
      key: cat,
      config: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]
    }));

  const firstTab = availableTabs[0]?.key || "driver";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background" id="fitting-report">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Your Prime Swing Fits Results
            </h1>
            <p className="text-muted-foreground">
              {session?.player_name || "Golfer"} • Completed {session?.updated_at ? new Date(session.updated_at).toLocaleDateString() : ""}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"} fitted: {selectedCategories.map(c => CATEGORY_CONFIG[c as keyof typeof CATEGORY_CONFIG]?.label).join(", ")}
            </p>
          </div>

          <Card className="mb-8 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                Your Personalized Club Fitting
              </CardTitle>
              <CardDescription>
                Complete specifications optimized for your swing, physique, and goals
              </CardDescription>
            </CardHeader>
          </Card>

          {availableTabs.length > 0 ? (
            <Tabs defaultValue={firstTab} className="mb-8">
              <TabsList className="w-full h-auto flex-wrap md:flex-nowrap justify-start gap-2 bg-muted/50 p-2 overflow-x-auto">
                {availableTabs.map(({ key, config }) => (
                  <TabsTrigger 
                    key={key}
                    value={key}
                    className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground flex-shrink-0 px-4 py-2 text-sm md:text-base"
                  >
                    {config.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {availableTabs.map(({ key }) => (
                <TabsContent key={key} value={key} className="mt-6">
                  {key === "golf_ball" ? (
                    renderGolfBallsTab()
                  ) : (
                    renderCategoryCard(key, <Target className="w-5 h-5 text-accent" />)
                  )}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No fitting data available</p>
              </CardContent>
            </Card>
          )}

          {/* Add more categories CTA */}
          {selectedCategories.length < 7 && (
            <Card className="mb-8 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Want to fit more clubs?</h3>
                    <p className="text-sm text-muted-foreground">
                      Add {7 - selectedCategories.length} more {7 - selectedCategories.length === 1 ? "category" : "categories"} to complete your full bag fitting
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/fitting/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Categories
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleEmailReport}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Report
                </>
              )}
            </Button>
            <Button asChild variant="outline">
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