import React, { useEffect, useState } from "react";
import Link from "next/link";

// Force dynamic rendering (skip static generation at build time)
export const dynamic = 'force-dynamic';
import { useTheme } from "next-themes";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Eye, Download, Clock, CheckCircle2, Target, Trophy, TrendingUp, Lightbulb, Activity, ArrowUp, ArrowDown, Minus, Gauge, Share2, Settings, X, RotateCcw } from "lucide-react";
import { BadgeShelf } from "@/components/gamification/BadgeShelf";
import { GoalsList } from "@/components/gamification/GoalsList";
import { InsightsPanel } from "@/components/gamification/InsightsPanel";
import { WeeklySummary } from "@/components/analytics/WeeklySummary";
import { ProgressCharts } from "@/components/analytics/ProgressCharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
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
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [clubPreferences, setClubPreferences] = useState<Record<string, { name: string; flex: string; loft: string }>>({});
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

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
      
      const totalSessions = sessionsRes.data?.length || 0;
      const completedSessions = sessionsRes.data?.filter(s => s.status === "completed").length || 0;
      const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSessions = sessionsRes.data?.filter(s => new Date(s.created_at) > thirtyDaysAgo).length || 0;
      
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
      
      const { data: swingMetrics, error: swingMetricsError } = await supabase
        .from("swing_metrics")
        .select("club_speed, carry_distance, created_at")
        .eq("user_id", user.id)
        .not("club_speed", "is", null)
        .not("carry_distance", "is", null)
        .order("created_at", { ascending: false })
        .limit(30);

      if (swingMetrics && swingMetrics.length > 0) {
        const sessions: Array<{ avgSpeed: number; avgDistance: number }> = [];
        for (let i = 0; i < Math.min(swingMetrics.length, 30); i += 5) {
          const sessionShots = swingMetrics.slice(i, i + 5);
          const avgSpeed = sessionShots.reduce((sum, shot) => sum + (shot.club_speed || 0), 0) / sessionShots.length;
          const avgDistance = sessionShots.reduce((sum, shot) => sum + (shot.carry_distance || 0), 0) / sessionShots.length;
          sessions.push({ avgSpeed, avgDistance });
        }

        const last6Sessions = sessions.slice(0, 6).reverse();
        
        const chartData = last6Sessions.map((session, idx) => ({
          session: idx + 1,
          speed: Math.round(session.avgSpeed),
        }));

        const avgClubSpeed = Math.round(
          last6Sessions.reduce((sum, s) => sum + s.avgSpeed, 0) / last6Sessions.length
        );
        const avgCarryDistance = Math.round(
          last6Sessions.reduce((sum, s) => sum + s.avgDistance, 0) / last6Sessions.length
        );

        let recommendedFlex = "Regular";
        if (avgClubSpeed >= 110) recommendedFlex = "X-Stiff";
        else if (avgClubSpeed >= 100) recommendedFlex = "Stiff";
        else if (avgClubSpeed >= 85) recommendedFlex = "Regular";
        else if (avgClubSpeed >= 75) recommendedFlex = "Senior";
        else recommendedFlex = "Lady";

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

      const { data: recentFittingData } = await supabase
        .from("fitting_sessions")
        .select(`
          id, 
          completed_at,
          fitting_recommendations (
            driver_spec,
            fairway_woods,
            hybrids,
            irons_spec,
            wedges_spec,
            putter_spec,
            shaft_flex_rec,
            golf_ball_rec,
            ball_compression,
            ball_spin_rating,
            ball_optimal_swing_speed
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1);

      if (recentFittingData && recentFittingData.length > 0 && recentFittingData[0].fitting_recommendations) {
        const session = recentFittingData[0];
        const recs = session.fitting_recommendations[0] as any;
        
        const clubs = [];
        
        if (recs.driver_spec) {
          clubs.push({
            type: "Driver",
            name: recs.driver_spec || "TaylorMade Stealth 2",
            flex: recs.shaft_flex_rec || "Stiff",
            loft: "10.5°",
            isRecent: true,
          });
        }
        
        if (recs.fairway_woods) {
          clubs.push({
            type: "3-Wood",
            name: recs.fairway_woods || "Callaway Paradym",
            flex: recs.shaft_flex_rec || "Stiff",
            loft: "15°",
            isRecent: true,
          });
        }
        
        if (recs.hybrids) {
          clubs.push({
            type: "Hybrid",
            name: recs.hybrids || "Ping G430",
            flex: recs.shaft_flex_rec || "Stiff",
            loft: "19°",
            isRecent: true,
          });
        }
        
        if (recs.irons_spec) {
          clubs.push({
            type: "Irons (5-PW)",
            name: recs.irons_spec || "Titleist T200",
            flex: recs.shaft_flex_rec || "Regular",
            loft: "5i-PW",
            isRecent: true,
          });
        }
        
        if (recs.wedges_spec) {
          clubs.push({
            type: "Wedges",
            name: recs.wedges_spec || "Vokey SM9",
            flex: "Wedge",
            loft: "52°, 56°, 60°",
            isRecent: true,
          });
        }
        
        if (recs.putter_spec) {
          clubs.push({
            type: "Putter",
            name: recs.putter_spec || "Scotty Cameron Special Select",
            flex: "—",
            loft: "3° lie 71°",
            isRecent: true,
          });
        }

        if (recs.golf_ball_rec) {
          clubs.push({
            type: "Golf Ball",
            name: recs.golf_ball_rec || "Titleist Pro V1",
            flex: `Compression ${recs.ball_compression || 90}`,
            loft: `${recs.ball_spin_rating || "Mid"} Spin`,
            isRecent: true,
          });
        }

        const savedPreferences = localStorage.getItem(`club_preferences_${user.id}`);
        if (savedPreferences) {
          const prefs = JSON.parse(savedPreferences);
          setClubPreferences(prefs);
          
          clubs.forEach(club => {
            if (prefs[club.type]) {
              Object.assign(club, prefs[club.type]);
            }
          });
        }

        setRecommendedBag({
          clubs,
          fittingDate: session.completed_at,
        });
      } else {
        setRecommendedBag(null);
      }

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

  const getClubTechSpecs = (clubType: string) => {
    const specs: Record<string, { cor: string; moi: string; forgiveness: string; launch: string; spin: string; }> = {
      "Driver": {
        cor: "0.830 (USGA Limit)",
        moi: "5,200 g·cm²",
        forgiveness: "9.5/10",
        launch: "Mid-High",
        spin: "2,400-2,800 RPM",
      },
      "3-Wood": {
        cor: "0.825",
        moi: "4,100 g·cm²",
        forgiveness: "8.5/10",
        launch: "Mid",
        spin: "3,200-3,800 RPM",
      },
      "Hybrid": {
        cor: "0.815",
        moi: "3,800 g·cm²",
        forgiveness: "9.0/10",
        launch: "Mid-High",
        spin: "4,000-4,800 RPM",
      },
      "Irons (5-PW)": {
        cor: "0.795",
        moi: "2,900 g·cm² (7i)",
        forgiveness: "8.0/10",
        launch: "Mid",
        spin: "5,500-7,000 RPM",
      },
      "Wedges": {
        cor: "0.780",
        moi: "2,500 g·cm²",
        forgiveness: "7.5/10",
        launch: "High",
        spin: "8,000-10,000 RPM",
      },
      "Putter": {
        cor: "0.720",
        moi: "5,500 g·cm²",
        forgiveness: "9.5/10",
        launch: "Low",
        spin: "1,200-1,800 RPM",
      },
      "Golf Ball": {
        cor: "0.830 (Tour Level)",
        moi: "N/A",
        forgiveness: "Variable",
        launch: "Dependent on Club",
        spin: "Variable by Design",
      },
    };
    
    return specs[clubType] || specs["Driver"];
  };

  const handleSavePreferences = async () => {
    if (!user || !recommendedBag) return;
    
    setIsSavingPreferences(true);
    try {
      localStorage.setItem(`club_preferences_${user.id}`, JSON.stringify(clubPreferences));
      
      const updatedBag = {
        ...recommendedBag,
        clubs: recommendedBag.clubs.map(club => ({
          ...club,
          ...(clubPreferences[club.type] || {}),
        })),
      };
      
      setRecommendedBag(updatedBag);
      setPreferencesOpen(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleResetPreferences = () => {
    if (!user) return;
    localStorage.removeItem(`club_preferences_${user.id}`);
    setClubPreferences({});
    if (recommendedBag) {
      window.location.reload();
    }
  };

  const updateClubPreference = (clubType: string, field: string, value: string) => {
    setClubPreferences(prev => ({
      ...prev,
      [clubType]: {
        name: (prev[clubType]?.name || ""),
        flex: (prev[clubType]?.flex || ""),
        loft: (prev[clubType]?.loft || ""),
        [field]: value,
      },
    }));
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
          {(userTier === "entry" || userTier === "core") && (
            <>
              <div className="relative mb-6 md:mb-8 h-[200px] md:h-[240px] overflow-hidden rounded-xl md:rounded-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-75"
                  style={{ 
                    backgroundImage: theme === 'dark' 
                      ? "url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop')" 
                      : "url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop')",
                    transform: `translateY(${parallaxOffset}px)`
                  }}
                />
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: theme === 'dark'
                      ? "linear-gradient(135deg, rgba(15, 26, 20, 0.75) 0%, rgba(22, 34, 24, 0.45) 100%)"
                      : "linear-gradient(135deg, rgba(27, 67, 50, 0.75) 0%, rgba(27, 67, 50, 0.45) 100%)"
                  }}
                />
                <div className="relative h-full flex flex-col justify-center px-4 md:px-8 py-4">
                  <div className="mb-4">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                    </h1>
                    <p className="text-white/90 text-sm md:text-lg drop-shadow-md">
                      Your personalized club fitting journey
                    </p>
                  </div>
                  <Button 
                    size="default"
                    asChild 
                    className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-gold-foreground shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold"
                  >
                    <Link href="/fitting/new">
                      <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Start New Fitting
                    </Link>
                  </Button>
                </div>
              </div>

              {fittingStats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 md:pt-6 pb-4 px-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-success/10 rounded-lg p-2 md:p-3 shrink-0">
                          <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-success" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total</p>
                          <p className="text-2xl md:text-3xl font-bold">{fittingStats.totalFittings}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 md:pt-6 pb-4 px-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-gold/10 rounded-lg p-2 md:p-3 shrink-0">
                          <Target className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Rate</p>
                          <p className="text-2xl md:text-3xl font-bold">{fittingStats.completionRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 md:pt-6 pb-4 px-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2 md:p-3 shrink-0">
                          <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">30 Days</p>
                          <p className="text-2xl md:text-3xl font-bold">{fittingStats.recentSessions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card className="mb-6 md:mb-8">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-gold shrink-0" />
                      <span className="text-base md:text-lg">Your Recommended Bag</span>
                    </CardTitle>
                    <div className="flex gap-2">
                      {recommendedBag && (
                        <>
                          <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-xs md:text-sm">
                                <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                Customize
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                                  <Settings className="h-4 w-4 md:h-5 md:w-5 text-gold" />
                                  Customize Your Bag
                                </DialogTitle>
                                <DialogDescription className="text-xs md:text-sm">
                                  Override any club recommendations below. Your preferences will be saved.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 md:space-y-6 py-4">
                                {recommendedBag.clubs.map((club) => {
                                  const pref = (clubPreferences[club.type] || { name: "", flex: "", loft: "" }) as { name: string; flex: string; loft: string };
                                  return (
                                    <div key={club.type} className="p-3 md:p-4 border rounded-lg space-y-3 md:space-y-4">
                                      <h4 className="font-semibold text-xs md:text-sm text-gold">{club.type}</h4>
                                      <div className="grid grid-cols-1 gap-3 md:gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor={`${club.type}-name`} className="text-xs md:text-sm">Club Model</Label>
                                          <Input
                                            id={`${club.type}-name`}
                                            placeholder={club.name}
                                            defaultValue={pref.name || ""}
                                            onChange={(e) => updateClubPreference(club.type, "name", e.target.value)}
                                            className="text-sm"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-2">
                                            <Label htmlFor={`${club.type}-flex`} className="text-xs md:text-sm">Shaft Flex</Label>
                                            <Select
                                              defaultValue={pref.flex || club.flex}
                                              onValueChange={(value) => updateClubPreference(club.type, "flex", value)}
                                            >
                                              <SelectTrigger id={`${club.type}-flex`} className="text-sm">
                                                <SelectValue placeholder={club.flex} />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="Lady">Lady</SelectItem>
                                                <SelectItem value="Senior">Senior</SelectItem>
                                                <SelectItem value="Regular">Regular</SelectItem>
                                                <SelectItem value="Stiff">Stiff</SelectItem>
                                                <SelectItem value="X-Stiff">X-Stiff</SelectItem>
                                                <SelectItem value="Wedge">Wedge</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor={`${club.type}-loft`} className="text-xs md:text-sm">Loft</Label>
                                            <Input
                                              id={`${club.type}-loft`}
                                              placeholder={club.loft}
                                              defaultValue={pref.loft || ""}
                                              onChange={(e) => updateClubPreference(club.type, "loft", e.target.value)}
                                              className="text-sm"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  onClick={handleResetPreferences}
                                  className="text-destructive hover:text-destructive text-xs md:text-sm"
                                >
                                  <RotateCcw className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                  Reset to Recommendations
                                </Button>
                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={() => setPreferencesOpen(false)} className="flex-1 sm:flex-none text-xs md:text-sm">
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleSavePreferences}
                                    disabled={isSavingPreferences}
                                    className="flex-1 sm:flex-none bg-gold hover:bg-gold/90 text-xs md:text-sm"
                                  >
                                    {isSavingPreferences ? "Saving..." : "Save Preferences"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" onClick={handleShareBag} className="text-xs md:text-sm">
                            <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            Share
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {recommendedBag ? (
                    <div className="space-y-6">
                      <div className="flex justify-center lg:hidden">
                        <svg
                          viewBox="0 0 200 300"
                          className="w-32 h-auto"
                          fill="none"
                        >
                          <path
                            d="M60 80 L60 250 Q60 270 80 270 L120 270 Q140 270 140 250 L140 80 Z"
                            fill="#1B4332"
                            stroke="#D4AF37"
                            strokeWidth="2"
                          />
                          <ellipse cx="100" cy="80" rx="40" ry="15" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                          <path d="M70 100 Q50 150 55 200" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" fill="none" />
                          <path d="M130 100 Q150 150 145 200" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" fill="none" />
                          <line x1="85" y1="60" x2="85" y2="75" stroke="#D4AF37" strokeWidth="2" />
                          <line x1="95" y1="55" x2="95" y2="70" stroke="#D4AF37" strokeWidth="2" />
                          <line x1="105" y1="55" x2="105" y2="70" stroke="#D4AF37" strokeWidth="2" />
                          <line x1="115" y1="60" x2="115" y2="75" stroke="#D4AF37" strokeWidth="2" />
                          <circle cx="85" cy="55" r="5" fill="#D4AF37" />
                          <circle cx="95" cy="50" r="5" fill="#D4AF37" />
                          <circle cx="105" cy="50" r="5" fill="#D4AF37" />
                          <circle cx="115" cy="55" r="5" fill="#D4AF37" />
                          <rect x="75" y="150" width="50" height="35" rx="8" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                          <circle cx="100" cy="167" r="3" fill="#D4AF37" />
                          <ellipse cx="100" cy="270" rx="42" ry="12" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                        </svg>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className="hidden lg:flex justify-center">
                          <svg
                            viewBox="0 0 200 300"
                            className="w-full max-w-[200px] h-auto"
                            fill="none"
                          >
                            <path
                              d="M60 80 L60 250 Q60 270 80 270 L120 270 Q140 270 140 250 L140 80 Z"
                              fill="#1B4332"
                              stroke="#D4AF37"
                              strokeWidth="2"
                            />
                            <ellipse cx="100" cy="80" rx="40" ry="15" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                            <path d="M70 100 Q50 150 55 200" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" fill="none" />
                            <path d="M130 100 Q150 150 145 200" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" fill="none" />
                            <line x1="85" y1="60" x2="85" y2="75" stroke="#D4AF37" strokeWidth="2" />
                            <line x1="95" y1="55" x2="95" y2="70" stroke="#D4AF37" strokeWidth="2" />
                            <line x1="105" y1="55" x2="105" y2="70" stroke="#D4AF37" strokeWidth="2" />
                            <line x1="115" y1="60" x2="115" y2="75" stroke="#D4AF37" strokeWidth="2" />
                            <circle cx="85" cy="55" r="5" fill="#D4AF37" />
                            <circle cx="95" cy="50" r="5" fill="#D4AF37" />
                            <circle cx="105" cy="50" r="5" fill="#D4AF37" />
                            <circle cx="115" cy="55" r="5" fill="#D4AF37" />
                            <rect x="75" y="150" width="50" height="35" rx="8" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                            <circle cx="100" cy="167" r="3" fill="#D4AF37" />
                            <ellipse cx="100" cy="270" rx="42" ry="12" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />
                          </svg>
                        </div>

                        <div className="lg:col-span-2 space-y-3">
                          <TooltipProvider>
                            {recommendedBag.clubs.map((club, idx) => {
                              const specs = getClubTechSpecs(club.type);
                              return (
                                <Tooltip key={idx}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`flex items-center justify-between p-3 md:p-4 rounded-lg border transition-all cursor-help ${
                                        club.isRecent
                                          ? 'border-gold bg-gold/5 shadow-md hover:shadow-lg'
                                          : 'border-border bg-muted/30 hover:bg-muted/50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`rounded-lg p-2 shrink-0 ${
                                          club.isRecent ? 'bg-gold/10' : 'bg-muted'
                                        }`}>
                                          {club.type === "Golf Ball" ? (
                                            <svg
                                              viewBox="0 0 24 24"
                                              className={`w-5 h-5 md:w-6 md:h-6 ${
                                                club.isRecent ? 'text-gold' : 'text-muted-foreground'
                                              }`}
                                              fill="currentColor"
                                            >
                                              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                                              <circle cx="7" cy="7" r="1" />
                                              <circle cx="12" cy="7" r="1" />
                                              <circle cx="17" cy="7" r="1" />
                                              <circle cx="7" cy="12" r="1" />
                                              <circle cx="17" cy="12" r="1" />
                                              <circle cx="7" cy="17" r="1" />
                                              <circle cx="12" cy="17" r="1" />
                                              <circle cx="17" cy="17" r="1" />
                                              <circle cx="9.5" cy="9.5" r="0.8" />
                                              <circle cx="14.5" cy="9.5" r="0.8" />
                                              <circle cx="9.5" cy="14.5" r="0.8" />
                                              <circle cx="14.5" cy="14.5" r="0.8" />
                                            </svg>
                                          ) : (
                                            <svg
                                              viewBox="0 0 24 24"
                                              className={`w-5 h-5 md:w-6 md:h-6 ${
                                                club.isRecent ? 'text-gold' : 'text-muted-foreground'
                                              }`}
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                            >
                                              <path d="M12 2 L12 18 M12 18 L8 16 M12 18 L16 16 M9 22 L15 22" />
                                            </svg>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-xs md:text-sm mb-1 truncate">{club.type}</h4>
                                          <p className="text-xs text-muted-foreground truncate">{club.name}</p>
                                        </div>
                                      </div>
                                      <div className="text-right ml-3 shrink-0">
                                        <p className="text-xs md:text-sm font-medium">{club.flex}</p>
                                        <p className="text-xs text-muted-foreground">{club.loft}</p>
                                      </div>
                                      {club.isRecent && (
                                        <Badge className="ml-2 md:ml-3 bg-gold/20 text-gold border-gold/30 text-xs">
                                          Latest
                                        </Badge>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="w-80 p-4 bg-card border-gold/20">
                                    <div className="space-y-3">
                                      <div>
                                        <h4 className="font-bold text-sm mb-2 text-gold">{club.type} Tech Specs</h4>
                                        <p className="text-xs text-muted-foreground mb-3">{club.name}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                          <p className="text-muted-foreground mb-1">COR Rating</p>
                                          <p className="font-semibold">{specs.cor}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground mb-1">MOI</p>
                                          <p className="font-semibold">{specs.moi}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground mb-1">Forgiveness</p>
                                          <p className="font-semibold text-success">{specs.forgiveness}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground mb-1">Launch Angle</p>
                                          <p className="font-semibold">{specs.launch}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <p className="text-muted-foreground mb-1">Spin Rate</p>
                                          <p className="font-semibold">{specs.spin}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </TooltipProvider>
                          {recommendedBag.fittingDate && (
                            <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                              Based on fitting completed {new Date(recommendedBag.fittingDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 md:py-16 text-center">
                      <div className="max-w-lg mx-auto px-4">
                        <div className="relative w-32 h-48 md:w-48 md:h-64 mx-auto mb-6">
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
                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                          Complete a fitting to build your bag
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground mb-6">
                          Get personalized club recommendations based on your swing characteristics, experience level, and playing goals.
                        </p>
                        <Button asChild size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold/90">
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

              <Card className="mb-6 md:mb-8 border-gold/30 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-32 translate-x-32" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-gold mb-2 text-base md:text-lg">
                        <Trophy className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                        <span>Unlock Advanced Swing Analytics</span>
                      </CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Track every swing, get AI-powered insights, and improve your game with data-driven recommendations
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-success/10 rounded-lg p-2 mt-1 shrink-0">
                        <Activity className="h-4 w-4 md:h-5 md:w-5 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs md:text-sm mb-1">Import Swing Data</h4>
                        <p className="text-xs text-muted-foreground">Track club speed, distance, and accuracy from launch monitors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-gold/10 rounded-lg p-2 mt-1 shrink-0">
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs md:text-sm mb-1">AI Weekly Summary</h4>
                        <p className="text-xs text-muted-foreground">Get personalized insights on improvements and focus areas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-lg p-2 mt-1 shrink-0">
                        <Target className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs md:text-sm mb-1">Advanced Analytics</h4>
                        <p className="text-xs text-muted-foreground">Visualize trends, set goals, and track consistency over time</p>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold/90">
                    <Link href="/pricing">
                      <Trophy className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Upgrade to Premium
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {userTier === "core" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                  <Card>
                    <CardContent className="pt-4 md:pt-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="bg-accent/10 rounded-full p-2 md:p-3 shrink-0">
                          <Trophy className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">Badges Earned</p>
                          <p className="text-xl md:text-2xl font-bold">{stats.badges}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4 md:pt-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="bg-accent/10 rounded-full p-2 md:p-3 shrink-0">
                          <Target className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">Active Goals</p>
                          <p className="text-xl md:text-2xl font-bold">{stats.activeGoals}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4 md:pt-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="bg-gold/10 rounded-full p-2 md:p-3 shrink-0">
                          <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">AI Insights</p>
                          <p className="text-xl md:text-2xl font-bold">{stats.insights}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card className="mb-6 md:mb-8">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Your Fitting Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <div className="py-12 md:py-16 text-center">
                      <div className="max-w-md mx-auto px-4">
                        <div className="bg-muted rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-6">
                          <Target className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold mb-3">Start Your First Fitting</h3>
                        <p className="text-sm md:text-base text-muted-foreground mb-6">
                          Get personalized club recommendations with Prime Swing Fits' guided fitting wizard.
                        </p>
                        <Button size="lg" asChild className="w-full sm:w-auto">
                          <Link href="/fitting/new">
                            Begin Fitting Process
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {sessions.map((session) => (
                        <Card key={session.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-4 md:pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                  <h3 className="text-base md:text-lg font-semibold">
                                    Fitting Session
                                  </h3>
                                  {session.status === "in_progress" ? (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      In Progress
                                    </Badge>
                                  ) : (
                                    <Badge variant="success" className="bg-success/10 text-success border-success/20 text-xs">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                                  <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
                                  {session.completed_at && (
                                    <p>Completed: {new Date(session.completed_at).toLocaleDateString()}</p>
                                  )}
                                  {session.status === "in_progress" && (
                                    <p>Current Step: {session.current_step} of 8</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {session.status === "in_progress" ? (
                                  <Button asChild size="sm" className="w-full sm:w-auto">
                                    <Link href={`/fitting/${session.id}/step/${session.current_step}`}>
                                      <Play className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Resume
                                    </Link>
                                  </Button>
                                ) : (
                                  <>
                                    <Button asChild size="sm" className="w-full sm:w-auto">
                                      <Link href={`/fitting/${session.id}/results`}>
                                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                        View Results
                                      </Link>
                                    </Button>
                                    <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
                                      <Link href={`/fitting/${session.id}/report`}>
                                        <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
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

              {userTier === "core" && (
                <div className="mt-6 md:mt-8">
                  <Tabs defaultValue="badges" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto">
                      <TabsTrigger value="badges" className="text-xs md:text-sm py-2 md:py-3">
                        <Trophy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Badges</span>
                      </TabsTrigger>
                      <TabsTrigger value="goals" className="text-xs md:text-sm py-2 md:py-3">
                        <Target className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Goals</span>
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="text-xs md:text-sm py-2 md:py-3">
                        <Lightbulb className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Insights</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="badges" className="mt-4 md:mt-6">
                      {user && <BadgeShelf userId={user.id} />}
                    </TabsContent>

                    <TabsContent value="goals" className="mt-4 md:mt-6">
                      {user && <GoalsList userId={user.id} />}
                    </TabsContent>

                    <TabsContent value="insights" className="mt-4 md:mt-6">
                      {user && <InsightsPanel userId={user.id} />}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {user && (
                <div className="mb-6 md:mb-8">
                  <ProgressCharts userId={user.id} />
                </div>
              )}
            </>
          )}

          {userTier === "premium" && (
            <>
              <div className="relative mb-6 md:mb-8 h-[240px] md:h-[300px] overflow-hidden rounded-xl md:rounded-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-75"
                  style={{ 
                    backgroundImage: theme === 'dark'
                      ? "url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop')"
                      : "url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop')",
                    transform: `translateY(${parallaxOffset}px)`
                  }}
                />
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: theme === 'dark'
                      ? "linear-gradient(135deg, rgba(15, 26, 20, 0.75) 0%, rgba(22, 34, 24, 0.45) 100%)"
                      : "linear-gradient(135deg, rgba(27, 67, 50, 0.75) 0%, rgba(27, 67, 50, 0.45) 100%)"
                  }}
                />
                
                <div className="relative h-full flex flex-col justify-center px-4 md:px-8 py-4">
                  <div className="mb-4">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                    </h1>
                    <p className="text-sm md:text-lg text-white/90 drop-shadow-md">
                      Track your progress and manage your fitting sessions
                    </p>
                  </div>
                  
                  <Button 
                    size="lg" 
                    asChild 
                    className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-gold-foreground shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold"
                  >
                    <Link href="/fitting/new">
                      <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Start New Fitting
                    </Link>
                  </Button>
                </div>
              </div>

              {fittingStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 md:pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="bg-success/10 rounded-lg p-2 md:p-3 mb-2">
                          <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-success" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Total Fittings</p>
                        <p className="text-xl md:text-2xl font-bold">{fittingStats.totalFittings}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 md:pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="bg-gold/10 rounded-lg p-2 md:p-3 mb-2">
                          <Target className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                        <p className="text-xl md:text-2xl font-bold">{fittingStats.completionRate}%</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 md:pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 rounded-lg p-2 md:p-3 mb-2">
                          <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Last 30 Days</p>
                        <p className="text-xl md:text-2xl font-bold">{fittingStats.recentSessions}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 md:pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className={`rounded-lg p-2 md:p-3 mb-2 ${
                          fittingStats.trend === "up" ? "bg-success/10" : 
                          fittingStats.trend === "down" ? "bg-destructive/10" : 
                          "bg-muted"
                        }`}>
                          {fittingStats.trend === "up" && <ArrowUp className="h-5 w-5 md:h-6 md:w-6 text-success" />}
                          {fittingStats.trend === "down" && <ArrowDown className="h-5 w-5 md:h-6 md:w-6 text-destructive" />}
                          {fittingStats.trend === "stable" && <Minus className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Trend</p>
                        <div className="text-xs font-semibold">
                          {fittingStats.trend === "up" && <Badge variant="success" className="text-xs">Growing</Badge>}
                          {fittingStats.trend === "down" && <Badge variant="destructive" className="text-xs">Declining</Badge>}
                          {fittingStats.trend === "stable" && <Badge variant="secondary" className="text-xs">Steady</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card className="mb-6 md:mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Activity className="h-5 w-5 text-success shrink-0" />
                    Your Swing Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {swingSnapshot ? (
                    <div className="space-y-6 md:space-y-8">
                      <div className="bg-primary rounded-xl p-4 md:p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
                        <div className="relative">
                          <p className="text-white/70 text-xs md:text-sm mb-4">Club Speed Trend (Last 6 Sessions)</p>
                          <div className="h-32 md:h-48 flex items-end justify-between gap-1 md:gap-2">
                            {swingSnapshot.chartData.map((point, idx) => {
                              const maxSpeed = Math.max(...swingSnapshot.chartData.map(p => p.speed));
                              const minSpeed = Math.min(...swingSnapshot.chartData.map(p => p.speed));
                              const range = maxSpeed - minSpeed || 1;
                              const heightPercent = ((point.speed - minSpeed) / range) * 70 + 30;
                              
                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1 md:gap-2">
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                        <div className="flex items-center justify-between p-3 md:p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 md:gap-3 flex-1">
                            <div className="bg-success/10 rounded-lg p-2 md:p-3 shrink-0">
                              <Gauge className="h-5 w-5 md:h-6 md:w-6 text-success" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground mb-1">Avg Club Speed</p>
                              <p className="text-xl md:text-3xl font-bold">{swingSnapshot.avgClubSpeed} <span className="text-sm md:text-lg text-muted-foreground">mph</span></p>
                            </div>
                          </div>
                          <div className={`p-2 rounded-full shrink-0 ${
                            swingSnapshot.speedTrend === "up" ? "bg-success/10" : 
                            swingSnapshot.speedTrend === "down" ? "bg-destructive/10" : 
                            "bg-muted"
                          }`}>
                            {swingSnapshot.speedTrend === "up" && <ArrowUp className="h-4 w-4 md:h-5 md:w-5 text-success" />}
                            {swingSnapshot.speedTrend === "down" && <ArrowDown className="h-4 w-4 md:h-5 md:w-5 text-destructive" />}
                            {swingSnapshot.speedTrend === "stable" && <Minus className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 md:p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 md:gap-3 flex-1">
                            <div className="bg-gold/10 rounded-lg p-2 md:p-3 shrink-0">
                              <Target className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground mb-1">Avg Carry Distance</p>
                              <p className="text-xl md:text-3xl font-bold">{swingSnapshot.avgCarryDistance} <span className="text-sm md:text-lg text-muted-foreground">yds</span></p>
                            </div>
                          </div>
                          <div className={`p-2 rounded-full shrink-0 ${
                            swingSnapshot.distanceTrend === "up" ? "bg-success/10" : 
                            swingSnapshot.distanceTrend === "down" ? "bg-destructive/10" : 
                            "bg-muted"
                          }`}>
                            {swingSnapshot.distanceTrend === "up" && <ArrowUp className="h-4 w-4 md:h-5 md:w-5 text-success" />}
                            {swingSnapshot.distanceTrend === "down" && <ArrowDown className="h-4 w-4 md:h-5 md:w-5 text-destructive" />}
                            {swingSnapshot.distanceTrend === "stable" && <Minus className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 md:p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 md:gap-3 flex-1">
                            <div className="bg-primary/10 rounded-lg p-2 md:p-3 shrink-0">
                              <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground mb-1">Recommended Flex</p>
                              <p className="text-xl md:text-3xl font-bold truncate">{swingSnapshot.recommendedFlex}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            Based on speed
                          </Badge>
                        </div>
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
                  ) : (
                    <div className="py-12 md:py-16 text-center">
                      <div className="max-w-lg mx-auto px-4">
                        <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto mb-6">
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
                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                          Complete your first fitting to see your swing data
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground mb-6">
                          Start tracking your club speed, carry distance, and get personalized recommendations to improve your game.
                        </p>
                        <Button asChild className="w-full sm:w-auto bg-gold hover:bg-gold/90">
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

              {user && (
                <div className="mb-6 md:mb-8">
                  <WeeklySummary userId={user.id} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                <Card>
                  <CardContent className="pt-4 md:pt-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="bg-accent/10 rounded-full p-2 md:p-3 shrink-0">
                        <Trophy className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground">Badges Earned</p>
                        <p className="text-xl md:text-2xl font-bold">{stats.badges}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 md:pt-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="bg-accent/10 rounded-full p-2 md:p-3 shrink-0">
                        <Target className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground">Active Goals</p>
                        <p className="text-xl md:text-2xl font-bold">{stats.activeGoals}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 md:pt-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="bg-gold/10 rounded-full p-2 md:p-3 shrink-0">
                        <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground">AI Insights</p>
                        <p className="text-xl md:text-2xl font-bold">{stats.insights}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {swingStats && (
                <Card className="mb-6 md:mb-8 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Activity className="h-5 w-5 text-accent shrink-0" />
                        Swing Analytics
                      </CardTitle>
                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto text-xs md:text-sm">
                        <Link href="/swing-analytics">
                          View Full Dashboard
                          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground mb-1">Last Session</p>
                        <p className="text-base md:text-lg font-semibold">
                          {swingStats.lastSession 
                            ? new Date(swingStats.lastSession).toLocaleDateString()
                            : "No sessions yet"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground mb-1">Consistency Score</p>
                        <p className="text-base md:text-lg font-semibold">
                          {swingStats.consistencyScore !== null ? `${swingStats.consistencyScore}%` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground mb-1">Latest Achievement</p>
                        <p className="text-base md:text-lg font-semibold truncate">
                          {swingStats.latestBadge || "Keep practicing!"}
                        </p>
                      </div>
                    </div>
                    {swingStats.sessionCount === 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs md:text-sm text-muted-foreground mb-3">
                          Track your swing data to get personalized insights and recommendations.
                        </p>
                        <Button asChild size="sm" className="w-full sm:w-auto">
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
                <TabsList className="grid w-full grid-cols-4 h-auto">
                  <TabsTrigger value="sessions" className="text-xs md:text-sm py-2 md:py-3">
                    <span className="hidden sm:inline">Fitting Sessions</span>
                    <span className="sm:hidden">Sessions</span>
                  </TabsTrigger>
                  <TabsTrigger value="badges" className="text-xs md:text-sm py-2 md:py-3">
                    <Trophy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Badges</span>
                  </TabsTrigger>
                  <TabsTrigger value="goals" className="text-xs md:text-sm py-2 md:py-3">
                    <Target className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Goals</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="text-xs md:text-sm py-2 md:py-3">
                    <Lightbulb className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Insights</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sessions" className="mt-4 md:mt-6">
                  {sessions.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 md:py-16 text-center">
                        <div className="max-w-md mx-auto px-4">
                          <div className="bg-muted rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-6">
                            <Target className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold mb-3">Start Your First Fitting</h3>
                          <p className="text-sm md:text-base text-muted-foreground mb-6">
                            Get personalized club recommendations with Prime Swing Fits' guided fitting wizard.
                          </p>
                          <Button size="lg" asChild className="w-full sm:w-auto">
                            <Link href="/fitting/new">
                              Begin Fitting Process
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {sessions.map((session) => (
                        <Card key={session.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-4 md:pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                  <h3 className="text-base md:text-lg font-semibold">
                                    Fitting Session
                                  </h3>
                                  {session.status === "in_progress" ? (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      In Progress
                                    </Badge>
                                  ) : (
                                    <Badge variant="success" className="bg-success/10 text-success border-success/20 text-xs">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                                  <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
                                  {session.completed_at && (
                                    <p>Completed: {new Date(session.completed_at).toLocaleDateString()}</p>
                                  )}
                                  {session.status === "in_progress" && (
                                    <p>Current Step: {session.current_step} of 8</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {session.status === "in_progress" ? (
                                  <Button asChild size="sm" className="w-full sm:w-auto">
                                    <Link href={`/fitting/${session.id}/step/${session.current_step}`}>
                                      <Play className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Resume
                                    </Link>
                                  </Button>
                                ) : (
                                  <>
                                    <Button asChild size="sm" className="w-full sm:w-auto">
                                      <Link href={`/fitting/${session.id}/results`}>
                                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                        View Results
                                      </Link>
                                    </Button>
                                    <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
                                      <Link href={`/fitting/${session.id}/report`}>
                                        <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
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

                <TabsContent value="badges" className="mt-4 md:mt-6">
                  {user && <BadgeShelf userId={user.id} />}
                </TabsContent>

                <TabsContent value="goals" className="mt-4 md:mt-6">
                  {user && <GoalsList userId={user.id} />}
                </TabsContent>

                <TabsContent value="insights" className="mt-4 md:mt-6">
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