import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwingDNARadar } from "@/components/analytics/SwingDNARadar";
import { WeeklySummary } from "@/components/analytics/WeeklySummary";
import { ProgressCharts } from "@/components/analytics/ProgressCharts";
import { Activity, TrendingUp, Target, BarChart3, Calendar, Download, Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UpgradeModal } from "@/components/swing-analytics/UpgradeModal";

export default function SwingAnalyticsIndex() {
  const router = useRouter();
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalShots: 0,
    avgConsistency: 0,
    activeDays: 0,
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkAccess = async () => {
      setLoading(true);
      try {
        // Check subscription tier
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("subscription_tier")
          .eq("user_id", user.id)
          .single();

        const allowedTiers = ["core", "premium", "premium_plus"];
        const access = profile?.subscription_tier ? allowedTiers.includes(profile.subscription_tier) : false;
        setHasAccess(access);

        if (!access) {
          setShowUpgradeModal(true);
        }

        // Load stats
        const { data: sessions, count: sessionCount } = await supabase
          .from("swing_sessions")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);

        const { data: metrics, count: shotCount } = await supabase
          .from("swing_metrics")
          .select("consistency_score", { count: "exact" })
          .eq("user_id", user.id);

        const avgConsistency = metrics && metrics.length > 0
          ? Math.round(metrics.reduce((sum, m) => sum + (m.consistency_score || 0), 0) / metrics.length)
          : 0;

        // Calculate unique active days
        const uniqueDays = sessions
          ? new Set(sessions.map(s => s.session_date?.split('T')[0])).size
          : 0;

        setStats({
          totalSessions: sessionCount || 0,
          totalShots: shotCount || 0,
          avgConsistency,
          activeDays: uniqueDays,
        });
      } catch (error) {
        console.error("Error checking access:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-muted rounded w-1/3" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Swing Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Track your progress, analyze your swing data, and improve your game
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/swing-data/import">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Link>
              </Button>
              <Button asChild>
                <Link href="/swing-data/import">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Session
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 rounded-lg p-3">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
                    <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gold/10 rounded-lg p-3">
                    <Target className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Shots</p>
                    <p className="text-2xl font-bold">{stats.totalShots}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-success/10 rounded-lg p-3">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg Consistency</p>
                    <p className="text-2xl font-bold">{stats.avgConsistency}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active Days</p>
                    <p className="text-2xl font-bold">{stats.activeDays}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend Analysis Charts */}
          <div className="mb-8">
            <ProgressCharts userId={user.id} />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="dna">
                <Target className="h-4 w-4 mr-2" />
                Swing DNA
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <Calendar className="h-4 w-4 mr-2" />
                Weekly Summary
              </TabsTrigger>
              <TabsTrigger value="trends">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>
                    Your swing analytics at a glance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.totalSessions === 0 ? (
                    <div className="py-16 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="bg-muted rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                          <Activity className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Start Tracking Your Swings</h3>
                        <p className="text-muted-foreground mb-6">
                          Import data from your launch monitor or manually log your sessions to get started.
                        </p>
                        <Button asChild>
                          <Link href="/swing-data/import">
                            <Upload className="h-4 w-4 mr-2" />
                            Import Swing Data
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-sm text-muted-foreground">
                        You have logged {stats.totalSessions} sessions with {stats.totalShots} total shots.
                        Your average consistency score is {stats.avgConsistency}%.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-2">Recent Activity</h4>
                          <p className="text-sm text-muted-foreground">
                            Active on {stats.activeDays} different days
                          </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-2">Performance</h4>
                          <p className="text-sm text-muted-foreground">
                            {stats.avgConsistency >= 80 ? "Excellent" : stats.avgConsistency >= 60 ? "Good" : "Keep practicing"} consistency
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dna" className="mt-6">
              <SwingDNARadar userId={user.id} />
            </TabsContent>

            <TabsContent value="weekly" className="mt-6">
              <WeeklySummary userId={user.id} />
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Track your improvement over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Detailed trend analysis coming soon. Import more sessions to see your progress.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Upgrade Modal */}
          <UpgradeModal 
            isOpen={showUpgradeModal} 
            onClose={() => setShowUpgradeModal(false)} 
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}