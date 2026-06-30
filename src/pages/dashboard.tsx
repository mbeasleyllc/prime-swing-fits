import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useParallax } from "@/hooks/useParallax";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Eye, Download, Clock, CheckCircle2, Target, Trophy, TrendingUp, Lightbulb, Activity, ArrowUp, ArrowDown, Minus, Gauge, Share2 } from "lucide-react";
import { BadgeShelf } from "@/components/gamification/BadgeShelf";
import { GoalsList } from "@/components/gamification/GoalsList";
import { InsightsPanel } from "@/components/gamification/InsightsPanel";
import { WeeklySummary } from "@/components/analytics/WeeklySummary";

export default function Dashboard() {
  const { user } = useAuth();
  const parallaxOffset = useParallax({ speed: 0.3, direction: "down" });
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ badges: 0, activeGoals: 0, insights: 0 });
  const [swingStats, setSwingStats] = useState<{ lastSession: string | null; consistencyScore: number | null; latestBadge: string | null; sessionCount: number } | null>(null);
  const [userTier, setUserTier] = useState<string | null>(null);
  const [fittingStats, setFittingStats] = useState<{
    totalFittings: number;
    completionRate: number;
    recentSessions: number;
    trend: "up" | "down" | "stable";
  } | null>(null);
  const [swingSnapshot, setSwingSnapshot] = useState<{
    chartData: Array<{ session: number; speed: number }>;
    avgClubSpeed: number | null;
    avgCarryDistance: number | null;
    recommendedFlex: string | null;
    speedTrend: "up" | "down" | "stable";
    distanceTrend: "up" | "down" | "stable";
  } | null>(null);
  const [recommendedBag, setRecommendedBag] = useState<{
    clubs: Array<{
      type: string;
      name: string;
      flex: string;
      loft: string;
      isRecent: boolean;
    }>;
    fittingDate: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [sessionsRes, badgesRes, goalsRes, insightsRes, swingSessionsRes, latestBadgeRes, userRes] = await Promise.all([
        supabase
          .from("fitting_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("achievement_badges")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("swing_goals")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("status", "active"),
        supabase
          .from("swing_insights")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("swing_sessions")
          .select("session_date, consistency_score", { count: "exact" })
          .eq("user_id", user.id)
          .order("session_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("achievement_badges")
          .select("badge_name, earned_date")
          .eq("user_id", user.id)
          .order("earned_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("users")
          .select("subscription_tier")
          .eq("id", user.id)
          .single(),
      ]);

      if (sessionsRes.data) setSessions(sessionsRes.data);
      
      // Calculate fitting statistics
      const totalSessions = sessionsRes.data?.length || 0;
      const completedSessions = sessionsRes.data?.filter(s => s.status === "completed").length || 0;
      const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
      
      // Recent sessions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSessions = sessionsRes.data?.filter(s => new Date(s.created_at) > thirtyDaysAgo).length || 0;
      
      // Previous 30 days for trend
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const previousSessions = sessionsRes.data?.filter(s => {
        const date = new Date(s.created_at);
        return date > sixtyDaysAgo && date <= thirtyDaysAgo;
      }).length || 0;
      
      let trend: "up" | "down" | "stable" = "stable";
      if (recentSessions > previousSessions) trend = "up";
      else if (recentSessions < previousSessions) trend = "down";
      
      setFittingStats({
        totalFittings: completedSessions,
        completionRate,
        recentSessions,
        trend,
      });
      
      setStats({
        badges: badgesRes.count || 0,
        activeGoals: goalsRes.count || 0,
        insights: insightsRes.count || 0,
      });

      if (swingSessionsRes.data && !swingSessionsRes.error) {
        setSwingStats({
          lastSession: swingSessionsRes.data.session_date,
          consistencyScore: swingSessionsRes.data.consistency_score || null,
          latestBadge: latestBadgeRes.data?.badge_name || null,
          sessionCount: swingSessionsRes.count || 0,
        });
      } else {
        setSwingStats({
          lastSession: null,
          consistencyScore: null,
          latestBadge: null,
          sessionCount: 0,
        });
      }

      setUserTier(userRes.data?.subscription_tier || "entry");
      
      // Fetch swing snapshot data (last 6 sessions)
      const { data: swingMetrics, error: swingMetricsError } = await supabase
        .from("swing_metrics")
        .select("club_speed, carry_distance, created_at")
        .eq("user_id", user.id)
        .not("club_speed", "is", null)
        .not("carry_distance", "is", null)
        .order("created_at", { ascending: false })
        .limit(30);

      if (swingMetrics && swingMetrics.length > 0) {
        // Group by session (assume 5 shots per session, take averages)
        const sessions: Array<{ avgSpeed: number; avgDistance: number }> = [];
        for (let i = 0; i < Math.min(swingMetrics.length, 30); i += 5) {
          const sessionShots = swingMetrics.slice(i, i + 5);
          const avgSpeed = sessionShots.reduce((sum, shot) => sum + (shot.club_speed || 0), 0) / sessionShots.length;
          const avgDistance = sessionShots.reduce((sum, shot) => sum + (shot.carry_distance || 0), 0) / sessionShots.length;
          sessions.push({ avgSpeed, avgDistance });
        }

        // Take last 6 sessions
        const last6Sessions = sessions.slice(0, 6).reverse();
        
        // Create chart data
        const chartData = last6Sessions.map((session, idx) => ({
          session: idx + 1,
          speed: Math.round(session.avgSpeed),
        }));

        // Calculate overall averages
        const avgClubSpeed = Math.round(
          last6Sessions.reduce((sum, s) => sum + s.avgSpeed, 0) / last6Sessions.length
        );
        const avgCarryDistance = Math.round(
          last6Sessions.reduce((sum, s) => sum + s.avgDistance, 0) / last6Sessions.length
        );

        // Determine recommended flex based on club speed
        let recommendedFlex = "Regular";
        if (avgClubSpeed >= 110) recommendedFlex = "X-Stiff";
        else if (avgClubSpeed >= 100) recommendedFlex = "Stiff";
        else if (avgClubSpeed >= 85) recommendedFlex = "Regular";
        else if (avgClubSpeed >= 75) recommendedFlex = "Senior";
        else recommendedFlex = "Lady";

        // Calculate trends (first 3 vs last 3 sessions)
        const firstHalfSpeed = last6Sessions.slice(0, 3).reduce((sum, s) => sum + s.avgSpeed, 0) / 3;
        const secondHalfSpeed = last6Sessions.slice(3, 6).reduce((sum, s) => sum + s.avgSpeed, 0) / 3;
        const speedTrend = secondHalfSpeed > firstHalfSpeed + 2 ? "up" : secondHalfSpeed < firstHalfSpeed - 2 ? "down" : "stable";

        const firstHalfDistance = last6Sessions.slice(0, 3).reduce((sum, s) => sum + s.avgDistance, 0) / 3;
        const secondHalfDistance = last6Sessions.slice(3, 6).reduce((sum, s) => sum + s.avgDistance, 0) / 3;
        const distanceTrend = secondHalfDistance > firstHalfDistance + 5 ? "up" : secondHalfDistance < firstHalfDistance - 5 ? "down" : "stable";

        setSwingSnapshot({
          chartData,
          avgClubSpeed,
          avgCarryDistance,
          recommendedFlex,
          speedTrend,
          distanceTrend,
        });
      } else {
        setSwingSnapshot(null);
      }

      // Fetch recommended bag from most recent completed fitting
      // TODO: Verify fitting_sessions schema has recommendations column
      // const { data: recentFitting, error: fittingError } = await supabase
      //   .from("fitting_sessions")
      //   .select("id, recommendations, completed_at")
      //   .eq("user_id", user.id)
      //   .eq("status", "completed")
      //   .not("recommendations", "is", null)
      //   .order("completed_at", { ascending: false })
      //   .limit(1)
      //   .maybeSingle();

      // if (recentFitting && recentFitting.recommendations) {
      //   const recs = recentFitting.recommendations as any;
      //   const clubs = [
      //     {
      //       type: "Driver",
      //       name: recs.driver?.model || "TaylorMade Stealth 2",
      //       flex: recs.driver?.shaft_flex || "Stiff",
      //       loft: recs.driver?.loft || "10.5°",
      //       isRecent: true,
      //     },
      //     {
      //       type: "3-Wood",
      //       name: "Callaway Paradym",
      //       flex: recs.driver?.shaft_flex || "Stiff",
      //       loft: "15°",
      //       isRecent: true,
      //     },
      //     {
      //       type: "Hybrid",
      //       name: "Ping G430",
      //       flex: recs.driver?.shaft_flex || "Stiff",
      //       loft: "19°",
      //       isRecent: true,
      //     },
      //     {
      //       type: "Irons (5-PW)",
      //       name: recs.iron?.model || "Titleist T200",
      //       flex: recs.iron?.shaft_flex || "Regular",
      //       loft: "5i-PW",
      //       isRecent: true,
      //     },
      //     {
      //       type: "Wedges",
      //       name: "Vokey SM9",
      //       flex: "Wedge",
      //       loft: "52°, 56°, 60°",
      //       isRecent: false,
      //     },
      //     {
      //       type: "Putter",
      //       name: recs.putter?.model || "Scotty Cameron Special Select",
      //       flex: "—",
      //       loft: recs.putter?.lie_angle || "71°",
      //       isRecent: true,
      //     },
      //   ];

      //   setRecommendedBag({
      //     clubs,
      //     fittingDate: recentFitting.completed_at,
      //   });
      // } else {
      //   setRecommendedBag(null);
      // }
      
      // Show empty state until schema is verified
      setRecommendedBag(null);

      setIsLoading(false);
    };

    loadData();
  }, [user]);

  const handleShareBag = () => {
    if (!recommendedBag) return;
    
    const bagText = recommendedBag.clubs
      .map(club => `${club.type}: ${club.name} (${club.flex}, ${club.loft})`)
      .join('\n');
    
    const shareText = `My Prime Swing Fits Recommended Bag:\n\n${bagText}\n\nGet your personalized club fitting at primeswingfits.com`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Recommended Golf Bag',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Bag details copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-64 mb-4" />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl">
          {/* Entry and Core Tier Dashboard - Fitting Focus Only */}
          {(userTier === "entry" || userTier === "core") && (
            <>
              {/* Simplified Hero Banner */}
              <div className="relative mb-8 h-[200px] overflow-hidden rounded-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-75"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop')",
                    transform: `translateY(${parallaxOffset}px)`
                  }}
                />
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(27, 67, 50, 0.75) 0%, rgba(27, 67, 50, 0.45) 100%)"
                  }}
                />
                <div className="relative h-full flex items-center justify-between px-8">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                    </h1>
                    <p className="text-white/90 text-lg drop-shadow-md">
                      Your personalized club fitting journey
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    asChild 
                    className="bg-gold hover:bg-gold/90 text-gold-foreground shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold"
                  >
                    <Link href="/fitting/new">
                      <Play className="h-5 w-5 mr-2" />
                      Start New Fitting
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Fitting Summary Stats - Entry/Core */}
              {fittingStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-success/10 rounded-lg p-3">
                            <CheckCircle2 className="h-6 w-6 text-success" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Fittings</p>
                            <p className="text-2xl font-bold">{fittingStats.totalFittings}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-gold/10 rounded-lg p-3">
                            <Target className="h-6 w-6 text-gold" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                            <p className="text-2xl font-bold">{fittingStats.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-lg p-3">
                            <Activity className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Last 30 Days</p>
                            <p className="text-2xl font-bold">{fittingStats.recentSessions}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Your Recommended Bag - Entry/Core */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-gold" />
                      Your Recommended Bag
                    </CardTitle>
                    {recommendedBag && (
                      <Button variant="outline" size="sm" onClick={handleShareBag}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share My Bag
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {recommendedBag ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Golf Bag SVG */}
                      <div className="flex justify-center">
                        <svg
                          viewBox="0 0 200 300"
                          className="w-full max-w-[200px] h-auto"
                          fill="none"
                        >
                          {/* Golf Bag Body */}
                          <path
                            d="M60 80 L60 250 Q60 270 80 270 L120 270 Q140 270 140 250 L140 80 Z"
                            fill="#1B4332"
                            stroke="#D4AF37"
                            strokeWidth="2"
                          />
                          {/* Bag Top Opening */}
                          <ellipse cx="100" cy="80" rx="40" ry="15" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                          {/* Bag Straps */}
                          <path d="M70 100 Q50 150 55 200" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" fill="none" />
                          <path d="M130 100 Q150 150 145 200" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" fill="none" />
                          {/* Club Slots */}
                          <line x1="85" y1="60" x2="85" y2="75" stroke="#D4AF37" strokeWidth="2" />
                          <line x1="95" y1="55" x2="95" y2="70" stroke="#D4AF37" strokeWidth="2" />
                          <line x1="105" y1="55" x2="105" y2="70" stroke="#D4AF37" strokeWidth="2" />
                          <line x1="115" y1="60" x2="115" y2="75" stroke="#D4AF37" strokeWidth="2" />
                          {/* Club Heads (visible in bag) */}
                          <circle cx="85" cy="55" r="5" fill="#D4AF37" />
                          <circle cx="95" cy="50" r="5" fill="#D4AF37" />
                          <circle cx="105" cy="50" r="5" fill="#D4AF37" />
                          <circle cx="115" cy="55" r="5" fill="#D4AF37" />
                          {/* Bag Pocket */}
                          <rect x="75" y="150" width="50" height="35" rx="8" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                          <circle cx="100" cy="167" r="3" fill="#D4AF37" />
                          {/* Bag Base */}
                          <ellipse cx="100" cy="270" rx="42" ry="12" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                        </svg>
                      </div>

                      {/* Right: Club List */}
                      <div className="lg:col-span-2 space-y-3">
                        {recommendedBag.clubs.map((club, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                              club.isRecent
                                ? 'border-gold bg-gold/5 shadow-md'
                                : 'border-border bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`rounded-lg p-2 ${
                                club.isRecent ? 'bg-gold/10' : 'bg-muted'
                              }`}>
                                <svg
                                  viewBox="0 0 24 24"
                                  className={`w-6 h-6 ${
                                    club.isRecent ? 'text-gold' : 'text-muted-foreground'
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                >
                                  <path d="M12 2 L12 18 M12 18 L8 16 M12 18 L16 16 M9 22 L15 22" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">{club.type}</h4>
                                <p className="text-xs text-muted-foreground">{club.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{club.flex}</p>
                              <p className="text-xs text-muted-foreground">{club.loft}</p>
                            </div>
                            {club.isRecent && (
                              <Badge className="ml-3 bg-gold/20 text-gold border-gold/30">
                                Latest
                              </Badge>
                            )}
                          </div>
                        ))}
                        {recommendedBag.fittingDate && (
                          <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                            Based on fitting completed {new Date(recommendedBag.fittingDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="max-w-lg mx-auto">
                        {/* Placeholder Golf Bag Silhouette */}
                        <div className="relative w-48 h-64 mx-auto mb-6">
                          <svg
                            viewBox="0 0 200 300"
                            className="w-full h-full text-muted-foreground/20"
                            fill="currentColor"
                          >
                            <path d="M60 80 L60 250 Q60 270 80 270 L120 270 Q140 270 140 250 L140 80 Z" />
                            <ellipse cx="100" cy="80" rx="40" ry="15" />
                            <ellipse cx="100" cy="270" rx="42" ry="12" />
                            <rect x="75" y="150" width="50" height="35" rx="8" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-foreground">
                          Complete a fitting to build your bag
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Get personalized club recommendations based on your swing characteristics, experience level, and playing goals.
                        </p>
                        <Button asChild size="lg" className="bg-gold hover:bg-gold/90">
                          <Link href="/fitting/new">
                            <Play className="h-4 w-4 mr-2" />
                            Start Your Fitting
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upgrade to Premium Banner */}
              <Card className="mb-8 border-gold/30 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-32 translate-x-32" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-gold mb-2">
                        <Trophy className="h-6 w-6" />
                        Unlock Advanced Swing Analytics
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Track every swing, get AI-powered insights, and improve your game with data-driven recommendations
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-success/10 rounded-lg p-2 mt-1">
                        <Activity className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Import Swing Data</h4>
                        <p className="text-xs text-muted-foreground">Track club speed, distance, and accuracy from launch monitors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-gold/10 rounded-lg p-2 mt-1">
                        <TrendingUp className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">AI Weekly Summary</h4>
                        <p className="text-xs text-muted-foreground">Get personalized insights on improvements and focus areas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-lg p-2 mt-1">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Advanced Analytics</h4>
                        <p className="text-xs text-muted-foreground">Visualize trends, set goals, and track consistency over time</p>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="lg" className="bg-gold hover:bg-gold/90">
                    <Link href="/pricing">
                      <Trophy className="h-5 w-5 mr-2" />
                      Upgrade to Premium
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Gamification Stats - Core Tier Only */}
              {userTier === "core" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-accent/10 rounded-full p-3">
                          <Trophy className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Badges Earned</p>
                          <p className="text-2xl font-bold">{stats.badges}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-accent/10 rounded-full p-3">
                          <Target className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Active Goals</p>
                          <p className="text-2xl font-bold">{stats.activeGoals}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-gold/10 rounded-full p-3">
                          <Lightbulb className="h-6 w-6 text-gold" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">AI Insights</p>
                          <p className="text-2xl font-bold">{stats.insights}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Fitting Sessions - Entry/Core */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Fitting Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="bg-muted rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                          <Target className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Start Your First Fitting</h3>
                        <p className="text-muted-foreground mb-6">
                          Get personalized club recommendations with Prime Swing Fits' guided fitting wizard.
                        </p>
                        <Button size="lg" asChild>
                          <Link href="/fitting/new">
                            Begin Fitting Process
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <Card key={session.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">
                                    Fitting Session
                                  </h3>
                                  {session.status === "in_progress" ? (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                      <Clock className="h-3 w-3 mr-1" />
                                      In Progress
                                    </Badge>
                                  ) : (
                                    <Badge variant="success" className="bg-success/10 text-success border-success/20">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
                                  {session.completed_at && (
                                    <p>Completed: {new Date(session.completed_at).toLocaleDateString()}</p>
                                  )}
                                  {session.status === "in_progress" && (
                                    <p>Current Step: {session.current_step} of 6</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {session.status === "in_progress" ? (
                                  <Button asChild>
                                    <Link href={`/fitting/${session.id}/step/${session.current_step}`}>
                                      <Play className="h-4 w-4 mr-2" />
                                      Resume
                                    </Link>
                                  </Button>
                                ) : (
                                  <>
                                    <Button asChild>
                                      <Link href={`/fitting/${session.id}/results`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Results
                                      </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                      <Link href={`/fitting/${session.id}/report`}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Report
                                      </Link>
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Core Tier: Badges and Goals Tabs */}
              {userTier === "core" && (
                <div className="mt-8">
                  <Tabs defaultValue="badges" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="badges">
                        <Trophy className="h-4 w-4 mr-2" />
                        Badges
                      </TabsTrigger>
                      <TabsTrigger value="goals">
                        <Target className="h-4 w-4 mr-2" />
                        Goals
                      </TabsTrigger>
                      <TabsTrigger value="insights">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Insights
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="badges" className="mt-6">
                      {user && <BadgeShelf userId={user.id} />}
                    </TabsContent>

                    <TabsContent value="goals" className="mt-6">
                      {user && <GoalsList userId={user.id} />}
                    </TabsContent>

                    <TabsContent value="insights" className="mt-6">
                      {user && <InsightsPanel userId={user.id} />}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}

          {/* Premium Tier Dashboard - Full Features */}
          {userTier === "premium" && (
            <>
              {/* Hero Banner with Parallax Effect */}
              <div className="relative mb-8 h-[200px] overflow-hidden rounded-2xl">
                {/* Background Image with Parallax */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-75"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop')",
                    transform: `translateY(${parallaxOffset}px)`
                  }}
                />
                
                {/* Dark Green Gradient Overlay (60% opacity) */}
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(27, 67, 50, 0.75) 0%, rgba(27, 67, 50, 0.45) 100%)"
                  }}
                />
                
                {/* Content */}
                <div className="relative h-full flex items-center justify-between px-8">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                    </h1>
                    <p className="text-white/90 text-lg drop-shadow-md">
                      Track your progress and manage your fitting sessions
                    </p>
                  </div>
                  
                  {/* Prominent CTA Button */}
                  <Button 
                    size="lg" 
                    asChild 
                    className="bg-gold hover:bg-gold/90 text-gold-foreground shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold"
                  >
                    <Link href="/fitting/new">
                      <Play className="h-5 w-5 mr-2" />
                      Start New Fitting
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Fitting Summary Stats */}
              {fittingStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-success/10 rounded-lg p-3">
                            <CheckCircle2 className="h-6 w-6 text-success" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Fittings</p>
                            <p className="text-2xl font-bold">{fittingStats.totalFittings}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-gold/10 rounded-lg p-3">
                            <Target className="h-6 w-6 text-gold" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                            <p className="text-2xl font-bold">{fittingStats.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-lg p-3">
                            <Activity className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Last 30 Days</p>
                            <p className="text-2xl font-bold">{fittingStats.recentSessions}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-3 ${
                            fittingStats.trend === "up" ? "bg-success/10" : 
                            fittingStats.trend === "down" ? "bg-destructive/10" : 
                            "bg-muted"
                          }`}>
                            {fittingStats.trend === "up" && <ArrowUp className="h-6 w-6 text-success" />}
                            {fittingStats.trend === "down" && <ArrowDown className="h-6 w-6 text-destructive" />}
                            {fittingStats.trend === "stable" && <Minus className="h-6 w-6 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Activity Trend</p>
                            <p className="text-lg font-semibold">
                              {fittingStats.trend === "up" && <Badge variant="success" className="text-xs">Growing</Badge>}
                              {fittingStats.trend === "down" && <Badge variant="destructive" className="text-xs">Declining</Badge>}
                              {fittingStats.trend === "stable" && <Badge variant="secondary" className="text-xs">Steady</Badge>}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Your Swing Snapshot Widget */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-success" />
                    Your Swing Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {swingSnapshot ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Line Chart */}
                      <div className="bg-primary rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
                        <div className="relative">
                          <p className="text-white/70 text-sm mb-4">Club Speed Trend (Last 6 Sessions)</p>
                          <div className="h-48 flex items-end justify-between gap-2">
                            {swingSnapshot.chartData.map((point, idx) => {
                              const maxSpeed = Math.max(...swingSnapshot.chartData.map(p => p.speed));
                              const minSpeed = Math.min(...swingSnapshot.chartData.map(p => p.speed));
                              const range = maxSpeed - minSpeed || 1;
                              const heightPercent = ((point.speed - minSpeed) / range) * 70 + 30;
                              
                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                  <div className="w-full flex flex-col items-center">
                                    <span className="text-gold text-xs font-semibold mb-1">{point.speed}</span>
                                    <div 
                                      className="w-full bg-gold rounded-t-md transition-all duration-300"
                                      style={{ height: `${heightPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-white/50 text-xs">S{point.session}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right: Key Metrics */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-success/10 rounded-lg p-3">
                              <Gauge className="h-6 w-6 text-success" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Avg Club Speed</p>
                              <p className="text-3xl font-bold">{swingSnapshot.avgClubSpeed} <span className="text-lg text-muted-foreground">mph</span></p>
                            </div>
                          </div>
                          <div className={`p-2 rounded-full ${
                            swingSnapshot.speedTrend === "up" ? "bg-success/10" : 
                            swingSnapshot.speedTrend === "down" ? "bg-destructive/10" : 
                            "bg-muted"
                          }`}>
                            {swingSnapshot.speedTrend === "up" && <ArrowUp className="h-5 w-5 text-success" />}
                            {swingSnapshot.speedTrend === "down" && <ArrowDown className="h-5 w-5 text-destructive" />}
                            {swingSnapshot.speedTrend === "stable" && <Minus className="h-5 w-5 text-muted-foreground" />}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-gold/10 rounded-lg p-3">
                              <Target className="h-6 w-6 text-gold" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Avg Carry Distance</p>
                              <p className="text-3xl font-bold">{swingSnapshot.avgCarryDistance} <span className="text-lg text-muted-foreground">yds</span></p>
                            </div>
                          </div>
                          <div className={`p-2 rounded-full ${
                            swingSnapshot.distanceTrend === "up" ? "bg-success/10" : 
                            swingSnapshot.distanceTrend === "down" ? "bg-destructive/10" : 
                            "bg-muted"
                          }`}>
                            {swingSnapshot.distanceTrend === "up" && <ArrowUp className="h-5 w-5 text-success" />}
                            {swingSnapshot.distanceTrend === "down" && <ArrowDown className="h-5 w-5 text-destructive" />}
                            {swingSnapshot.distanceTrend === "stable" && <Minus className="h-5 w-5 text-muted-foreground" />}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 rounded-lg p-3">
                              <Activity className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Recommended Flex</p>
                              <p className="text-3xl font-bold">{swingSnapshot.recommendedFlex}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Based on speed
                          </Badge>
                        </div>

                        <div className="pt-4 border-t">
                          <Link 
                            href="/swing-analytics" 
                            className="text-gold hover:text-gold/80 text-sm font-medium underline decoration-gold/30 hover:decoration-gold/60 transition-all inline-flex items-center gap-1"
                          >
                            View Full Analytics
                            <TrendingUp className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="max-w-lg mx-auto">
                        <div className="relative w-48 h-48 mx-auto mb-6">
                          {/* Golfer Silhouette SVG */}
                          <svg
                            viewBox="0 0 200 200"
                            className="w-full h-full text-muted-foreground/20"
                            fill="currentColor"
                          >
                            <path d="M100 40 C85 40 75 50 75 65 C75 80 85 90 100 90 C115 90 125 80 125 65 C125 50 115 40 100 40 Z" />
                            <path d="M100 95 L100 150 M100 115 L70 100 M100 115 L130 130 M100 150 L70 180 M100 150 L130 180" 
                              stroke="currentColor" 
                              strokeWidth="6" 
                              strokeLinecap="round" 
                              fill="none"
                            />
                            <path d="M130 130 L160 100 L165 95" 
                              stroke="currentColor" 
                              strokeWidth="4" 
                              strokeLinecap="round" 
                              fill="none"
                            />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-foreground">
                          Complete your first fitting to see your swing data
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Start tracking your club speed, carry distance, and get personalized recommendations to improve your game.
                        </p>
                        <Button asChild className="bg-gold hover:bg-gold/90">
                          <Link href="/swing-data/import">
                            <Play className="h-4 w-4 mr-2" />
                            Import Swing Data
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Your Recommended Bag - Premium */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-gold" />
                      Your Recommended Bag
                    </CardTitle>
                    {recommendedBag && (
                      <Button variant="outline" size="sm" onClick={handleShareBag}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share My Bag
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {recommendedBag ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Golf Bag SVG */}
                      <div className="flex justify-center">
                        <svg
                          viewBox="0 0 200 300"
                          className="w-full max-w-[200px] h-auto"
                          fill="none"
                        >
                          {/* Golf Bag Body */}
                          <path
                            d="M60 80 L60 250 Q60 270 80 270 L120 270 Q140 270 140 250 L140 80 Z"
                            fill="#1B4332"
                            stroke="#D4AF37"
                            strokeWidth="2"
                          />
                          {/* Bag Top Opening */}
                          <ellipse cx="100" cy="80" rx="40" ry="15" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                          {/* Bag Straps */}
                          <path d="M70 100 Q50 150 55 200" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" fill="none" />
                          <path d="M130 100 Q150 150 145 200" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" fill="none" />
                          {/* Club Slots */}
                          <line x1="85" y1="60" x2="85" y2="75" stroke="#D4AF37" strokeWidth="2" />
                          <line x1="95" y1="55" x2="95" y2="70" stroke="#D4AF37" strokeWidth="2" />
                          <line x1="105" y1="55" x2="105" y2="70" stroke="#D4AF37" strokeWidth="2" />
                          <line x1="115" y1="60" x2="115" y2="75" stroke="#D4AF37" strokeWidth="2" />
                          {/* Club Heads (visible in bag) */}
                          <circle cx="85" cy="55" r="5" fill="#D4AF37" />
                          <circle cx="95" cy="50" r="5" fill="#D4AF37" />
                          <circle cx="105" cy="50" r="5" fill="#D4AF37" />
                          <circle cx="115" cy="55" r="5" fill="#D4AF37" />
                          {/* Bag Pocket */}
                          <rect x="75" y="150" width="50" height="35" rx="8" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                          <circle cx="100" cy="167" r="3" fill="#D4AF37" />
                          {/* Bag Base */}
                          <ellipse cx="100" cy="270" rx="42" ry="12" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                        </svg>
                      </div>

                      {/* Right: Club List */}
                      <div className="lg:col-span-2 space-y-3">
                        {recommendedBag.clubs.map((club, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                              club.isRecent
                                ? 'border-gold bg-gold/5 shadow-md'
                                : 'border-border bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`rounded-lg p-2 ${
                                club.isRecent ? 'bg-gold/10' : 'bg-muted'
                              }`}>
                                <svg
                                  viewBox="0 0 24 24"
                                  className={`w-6 h-6 ${
                                    club.isRecent ? 'text-gold' : 'text-muted-foreground'
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                >
                                  <path d="M12 2 L12 18 M12 18 L8 16 M12 18 L16 16 M9 22 L15 22" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">{club.type}</h4>
                                <p className="text-xs text-muted-foreground">{club.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{club.flex}</p>
                              <p className="text-xs text-muted-foreground">{club.loft}</p>
                            </div>
                            {club.isRecent && (
                              <Badge className="ml-3 bg-gold/20 text-gold border-gold/30">
                                Latest
                              </Badge>
                            )}
                          </div>
                        ))}
                        {recommendedBag.fittingDate && (
                          <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                            Based on fitting completed {new Date(recommendedBag.fittingDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="max-w-lg mx-auto">
                        {/* Placeholder Golf Bag Silhouette */}
                        <div className="relative w-48 h-64 mx-auto mb-6">
                          <svg
                            viewBox="0 0 200 300"
                            className="w-full h-full text-muted-foreground/20"
                            fill="currentColor"
                          >
                            <path d="M60 80 L60 250 Q60 270 80 270 L120 270 Q140 270 140 250 L140 80 Z" />
                            <ellipse cx="100" cy="80" rx="40" ry="15" />
                            <ellipse cx="100" cy="270" rx="42" ry="12" />
                            <rect x="75" y="150" width="50" height="35" rx="8" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-foreground">
                          Complete a fitting to build your bag
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Get personalized club recommendations based on your swing characteristics, experience level, and playing goals.
                        </p>
                        <Button asChild size="lg" className="bg-gold hover:bg-gold/90">
                          <Link href="/fitting/new">
                            <Play className="h-4 w-4 mr-2" />
                            Start Your Fitting
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Weekly Summary - Core and Premium users only */}
              {user && (
                <div className="mb-8">
                  <WeeklySummary userId={user.id} />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-accent/10 rounded-full p-3">
                        <Trophy className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Badges Earned</p>
                        <p className="text-2xl font-bold">{stats.badges}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-accent/10 rounded-full p-3">
                        <Target className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Goals</p>
                        <p className="text-2xl font-bold">{stats.activeGoals}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-gold/10 rounded-full p-3">
                        <Lightbulb className="h-6 w-6 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">AI Insights</p>
                        <p className="text-2xl font-bold">{stats.insights}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Swing Analytics Card */}
              {swingStats && (
                <Card className="mb-8 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-accent" />
                        Swing Analytics
                      </CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/swing-analytics">
                          View Full Dashboard
                          <TrendingUp className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Last Session</p>
                        <p className="text-lg font-semibold">
                          {swingStats.lastSession 
                            ? new Date(swingStats.lastSession).toLocaleDateString()
                            : "No sessions yet"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Consistency Score</p>
                        <p className="text-lg font-semibold">
                          {swingStats.consistencyScore !== null ? `${swingStats.consistencyScore}%` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Latest Achievement</p>
                        <p className="text-lg font-semibold">
                          {swingStats.latestBadge || "Keep practicing!"}
                        </p>
                      </div>
                    </div>
                    {swingStats.sessionCount === 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                          Track your swing data to get personalized insights and recommendations.
                        </p>
                        <Button asChild size="sm">
                          <Link href="/swing-data/import">
                            Import Swing Data
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="sessions" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sessions">Fitting Sessions</TabsTrigger>
                  <TabsTrigger value="badges">
                    <Trophy className="h-4 w-4 mr-2" />
                    Badges
                  </TabsTrigger>
                  <TabsTrigger value="goals">
                    <Target className="h-4 w-4 mr-2" />
                    Goals
                  </TabsTrigger>
                  <TabsTrigger value="insights">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Insights
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sessions" className="mt-6">
                  {sessions.length === 0 ? (
                    <Card>
                      <CardContent className="py-16 text-center">
                        <div className="max-w-md mx-auto">
                          <div className="bg-muted rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <Target className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h3 className="text-2xl font-bold mb-3">Start Your First Fitting</h3>
                          <p className="text-muted-foreground mb-6">
                            Get personalized club recommendations with Prime Swing Fits' guided fitting wizard.
                          </p>
                          <Button size="lg" asChild>
                            <Link href="/fitting/new">
                              Begin Fitting Process
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <Card key={session.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">
                                    Fitting Session
                                  </h3>
                                  {session.status === "in_progress" ? (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                      <Clock className="h-3 w-3 mr-1" />
                                      In Progress
                                    </Badge>
                                  ) : (
                                    <Badge variant="success" className="bg-success/10 text-success border-success/20">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
                                  {session.completed_at && (
                                    <p>Completed: {new Date(session.completed_at).toLocaleDateString()}</p>
                                  )}
                                  {session.status === "in_progress" && (
                                    <p>Current Step: {session.current_step} of 6</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {session.status === "in_progress" ? (
                                  <Button asChild>
                                    <Link href={`/fitting/${session.id}/step/${session.current_step}`}>
                                      <Play className="h-4 w-4 mr-2" />
                                      Resume
                                    </Link>
                                  </Button>
                                ) : (
                                  <>
                                    <Button asChild>
                                      <Link href={`/fitting/${session.id}/results`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Results
                                      </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                      <Link href={`/fitting/${session.id}/report`}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Report
                                      </Link>
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="badges" className="mt-6">
                  {user && <BadgeShelf userId={user.id} />}
                </TabsContent>

                <TabsContent value="goals" className="mt-6">
                  {user && <GoalsList userId={user.id} />}
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                  {user && <InsightsPanel userId={user.id} />}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}