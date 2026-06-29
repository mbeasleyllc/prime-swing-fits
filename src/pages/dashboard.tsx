import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Eye, Download, Clock, CheckCircle2, Target, Trophy, TrendingUp, Lightbulb } from "lucide-react";
import { BadgeShelf } from "@/components/gamification/BadgeShelf";
import { GoalsList } from "@/components/gamification/GoalsList";
import { InsightsPanel } from "@/components/gamification/InsightsPanel";

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ badges: 0, activeGoals: 0, insights: 0 });

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [sessionsRes, badgesRes, goalsRes, insightsRes] = await Promise.all([
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
      ]);

      if (sessionsRes.data) setSessions(sessionsRes.data);
      
      setStats({
        badges: badgesRes.count || 0,
        activeGoals: goalsRes.count || 0,
        insights: insightsRes.count || 0,
      });

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-muted-foreground">Track your progress and manage your fitting sessions</p>
            </div>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90">
              <Link href="/fitting/new">
                <Play className="h-5 w-5 mr-2" />
                Start New Fitting
              </Link>
            </Button>
          </div>

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
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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