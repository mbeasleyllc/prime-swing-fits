import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import { AlertCircle, Download, Printer, ArrowLeft, Play, Circle, Target, TrendingUp, Mail, Loader2 } from "lucide-react";
import { GOLF_BALL_DATABASE } from "@/data/golfBallDatabase";
import { CLUB_DATABASE } from "@/data/clubDatabase";
import { sendFittingReportWithPDF } from "@/lib/emailService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface RecommendationCategory {
  length?: string;
  lieAngle?: string;
  shaftFlex?: string;
  shaftWeight?: string;
  gripSize?: string;
  headStyle?: string;
  modelCategory?: string;
  explanation?: string;
  lofts?: string;
  bounce?: string;
  toeHang?: string;
}

interface FullBagRecommendations {
  driver?: RecommendationCategory;
  fairwayWood?: RecommendationCategory;
  hybrid?: RecommendationCategory;
  irons?: RecommendationCategory;
  wedges?: RecommendationCategory;
  putter?: RecommendationCategory;
  golfBalls?: Array<{
    name: string;
    compression: number;
    spinRate: string;
    optimalSpeed: string;
    matchScore: number;
  }>;
}

export default function FittingResults() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<FullBagRecommendations | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<Record<string, any[]>>({});
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const loadResults = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;

      const { data: sessionData } = await supabase
        .from("fitting_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (sessionData) {
        setSession(sessionData);
        
        // Parse recommendations from JSON with type assertion
        const rawData = sessionData as any;
        if (rawData.recommendations) {
          const recs = typeof rawData.recommendations === "string" 
            ? JSON.parse(rawData.recommendations)
            : rawData.recommendations;
          setRecommendations(recs);

          // Match products for each category
          matchProductsByCategory(recs);
        }
      }

      setIsLoading(false);
    };

    loadResults();
  }, [id, user]);

  const matchProductsByCategory = (recs: FullBagRecommendations) => {
    const matched: Record<string, any[]> = {};

    // Driver products
    if (recs.driver) {
      matched.driver = CLUB_DATABASE
        .filter(club => club.category === "Driver")
        .filter(club => {
          if (recs.driver?.shaftFlex && club.flex_category) {
            return club.flex_category.toLowerCase().includes(recs.driver.shaftFlex.toLowerCase());
          }
          return true;
        })
        .slice(0, 3);
    }

    // Fairway Wood products
    if (recs.fairwayWood) {
      matched.fairwayWood = CLUB_DATABASE
        .filter(club => club.category === "Fairway Wood")
        .slice(0, 3);
    }

    // Hybrid products
    if (recs.hybrid) {
      matched.hybrid = CLUB_DATABASE
        .filter(club => club.category === "Hybrid")
        .slice(0, 3);
    }

    // Iron products - filter by recommended_for text since no player_category field
    if (recs.irons) {
      matched.irons = CLUB_DATABASE
        .filter(club => club.category === "Irons")
        .filter(club => {
          if (recs.irons?.modelCategory && club.recommended_for) {
            const categoryLower = recs.irons.modelCategory.toLowerCase();
            const recForLower = club.recommended_for.join(" ").toLowerCase();
            
            // Map model categories to recommended_for keywords
            if (categoryLower.includes("game improvement") && recForLower.includes("game improvement")) return true;
            if (categoryLower.includes("player") && recForLower.includes("scratch")) return true;
            if (categoryLower.includes("distance") && recForLower.includes("distance")) return true;
            if (categoryLower.includes("tour") && (recForLower.includes("tour") || recForLower.includes("0-"))) return true;
          }
          return true;
        })
        .slice(0, 3);
    }

    // Wedge products
    if (recs.wedges) {
      matched.wedges = CLUB_DATABASE
        .filter(club => club.category === "Wedge")
        .slice(0, 3);
    }

    // Putter products - filter by recommended_for keywords since no head_type field
    if (recs.putter) {
      matched.putter = CLUB_DATABASE
        .filter(club => club.category === "Putter")
        .filter(club => {
          if (recs.putter?.headStyle && club.recommended_for) {
            const headStyleLower = recs.putter.headStyle.toLowerCase();
            const recForLower = club.recommended_for.join(" ").toLowerCase();
            
            // Map head styles to putter types
            if (headStyleLower.includes("blade") && recForLower.includes("blade")) return true;
            if (headStyleLower.includes("mallet") && recForLower.includes("mallet")) return true;
            if (headStyleLower.includes("face balanced") && recForLower.includes("straight")) return true;
          }
          return true;
        })
        .slice(0, 3);
    }

    setMatchedProducts(matched);
  };

  const handleEmailReport = async () => {
    if (!user || !session) return;

    setIsSendingEmail(true);

    try {
      // Generate PDF
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

      // Convert PDF to base64
      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      // Send email
      const result = await sendFittingReportWithPDF({
        to: user.email!,
        userName: session.player_name || user.email!.split("@")[0],
        sessionId: session.id,
        pdfBase64,
        recommendations: recommendations || {},
      });

      if (result.success) {
        toast({
          title: "Email sent! ✓",
          description: `Your fitting report has been sent to ${user.email}`,
        });
      } else {
        throw new Error("Failed to send email");
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
    title: string,
    icon: React.ReactNode,
    category: RecommendationCategory | undefined,
    products: any[]
  ) => {
    if (!category) return null;

    return (
      <div className="space-y-6">
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title} Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {category.length && (
                <div>
                  <p className="text-sm text-muted-foreground">Length</p>
                  <p className="font-semibold">{category.length}</p>
                </div>
              )}
              {category.lieAngle && (
                <div>
                  <p className="text-sm text-muted-foreground">Lie Angle</p>
                  <p className="font-semibold">{category.lieAngle}</p>
                </div>
              )}
              {category.shaftFlex && (
                <div>
                  <p className="text-sm text-muted-foreground">Shaft Flex</p>
                  <p className="font-semibold">{category.shaftFlex}</p>
                </div>
              )}
              {category.shaftWeight && (
                <div>
                  <p className="text-sm text-muted-foreground">Shaft Weight</p>
                  <p className="font-semibold">{category.shaftWeight}</p>
                </div>
              )}
              {category.gripSize && (
                <div>
                  <p className="text-sm text-muted-foreground">Grip Size</p>
                  <p className="font-semibold capitalize">{category.gripSize}</p>
                </div>
              )}
              {category.headStyle && (
                <div>
                  <p className="text-sm text-muted-foreground">Head Style</p>
                  <p className="font-semibold">{category.headStyle}</p>
                </div>
              )}
              {category.modelCategory && (
                <div>
                  <p className="text-sm text-muted-foreground">Model Type</p>
                  <p className="font-semibold">{category.modelCategory}</p>
                </div>
              )}
              {category.lofts && (
                <div>
                  <p className="text-sm text-muted-foreground">Lofts</p>
                  <p className="font-semibold">{category.lofts}</p>
                </div>
              )}
              {category.bounce && (
                <div>
                  <p className="text-sm text-muted-foreground">Bounce</p>
                  <p className="font-semibold">{category.bounce}</p>
                </div>
              )}
              {category.toeHang && (
                <div>
                  <p className="text-sm text-muted-foreground">Toe Hang</p>
                  <p className="font-semibold">{category.toeHang}</p>
                </div>
              )}
            </div>

            {category.explanation && (
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Why these specs?</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {category.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended {title}s</CardTitle>
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

  if (!recommendations) {
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Your Prime Swing Fits Results
            </h1>
            <p className="text-muted-foreground">
              {session?.player_name || "Golfer"} • Completed {session?.updated_at ? new Date(session.updated_at).toLocaleDateString() : ""}
            </p>
          </div>

          <Card className="mb-8 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                Your Personalized Full-Bag Fitting
              </CardTitle>
              <CardDescription>
                Complete club specifications optimized for your swing, physique, and goals
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="driver" className="mb-8">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="driver">Driver</TabsTrigger>
              <TabsTrigger value="woods">Woods & Hybrids</TabsTrigger>
              <TabsTrigger value="irons">Irons</TabsTrigger>
              <TabsTrigger value="wedges">Wedges</TabsTrigger>
              <TabsTrigger value="putter">Putter</TabsTrigger>
              <TabsTrigger value="balls">Golf Balls</TabsTrigger>
            </TabsList>

            <TabsContent value="driver" className="mt-6">
              {renderCategoryCard(
                "Driver",
                <Target className="w-5 h-5 text-accent" />,
                recommendations.driver,
                matchedProducts.driver || []
              )}
            </TabsContent>

            <TabsContent value="woods" className="mt-6 space-y-8">
              {renderCategoryCard(
                "Fairway Wood",
                <Target className="w-5 h-5 text-accent" />,
                recommendations.fairwayWood,
                matchedProducts.fairwayWood || []
              )}
              {renderCategoryCard(
                "Hybrid",
                <Target className="w-5 h-5 text-accent" />,
                recommendations.hybrid,
                matchedProducts.hybrid || []
              )}
            </TabsContent>

            <TabsContent value="irons" className="mt-6">
              {renderCategoryCard(
                "Iron",
                <Target className="w-5 h-5 text-accent" />,
                recommendations.irons,
                matchedProducts.irons || []
              )}
            </TabsContent>

            <TabsContent value="wedges" className="mt-6">
              {renderCategoryCard(
                "Wedge",
                <Target className="w-5 h-5 text-accent" />,
                recommendations.wedges,
                matchedProducts.wedges || []
              )}
            </TabsContent>

            <TabsContent value="putter" className="mt-6">
              {renderCategoryCard(
                "Putter",
                <Target className="w-5 h-5 text-accent" />,
                recommendations.putter,
                matchedProducts.putter || []
              )}
            </TabsContent>

            <TabsContent value="balls" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Golf Balls</CardTitle>
                  <CardDescription>
                    Top 5 golf balls matched to your swing profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.golfBalls && recommendations.golfBalls.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendations.golfBalls.map((ball, idx) => {
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
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No golf ball recommendations available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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