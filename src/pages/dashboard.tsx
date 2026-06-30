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
import { Play, Eye, Download, Clock, CheckCircle2, Target, Trophy, TrendingUp, Lightbulb, Activity, ArrowUp, ArrowDown, Minus } from "lucide-react";
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
      setIsLoading(false);
    };

    loadData();
  }, [user]);

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

          {/* AI Weekly Summary - Core and Premium users only */}
          {userTier !== "entry" && user && (
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
          {userTier !== "entry" && swingStats && (
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

          {/* Upgrade prompt for Entry tier */}
          {userTier === "entry" && (
            <Card className="mb-8 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold">
                  <Trophy className="h-5 w-5" />
                  Unlock Swing Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upgrade to Core or Premium to access advanced swing data tracking, AI insights, and personalized improvement goals.
                </p>
                <Button asChild className="bg-gold hover:bg-gold/90">
                  <Link href="/pricing">
                    View Premium Features
                  </Link>
                </Button>
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
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}