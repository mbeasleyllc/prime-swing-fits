import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, Award, TrendingUp, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFittings: 0,
    totalUsers: 0,
    mostCommonFlex: "",
    mostCommonClubType: "",
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      const [fittingsRes, usersRes, flexRes, clubTypeRes, sessionsRes] = await Promise.all([
        supabase.from("fitting_sessions").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("fitting_recommendations").select("shaft_flex_rec"),
        supabase.from("fitting_recommendations").select("club_type_rec"),
        supabase
          .from("fitting_sessions")
          .select("*, users(email)")
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(10),
      ]);

      const totalFittings = fittingsRes.count || 0;
      const totalUsers = usersRes.count || 0;

      const flexCounts: Record<string, number> = {};
      flexRes.data?.forEach((row) => {
        flexCounts[row.shaft_flex_rec] = (flexCounts[row.shaft_flex_rec] || 0) + 1;
      });
      const mostCommonFlex = Object.keys(flexCounts).length > 0
        ? Object.entries(flexCounts).sort((a, b) => b[1] - a[1])[0][0]
        : "N/A";

      const clubTypeCounts: Record<string, number> = {};
      clubTypeRes.data?.forEach((row) => {
        clubTypeCounts[row.club_type_rec] = (clubTypeCounts[row.club_type_rec] || 0) + 1;
      });
      const mostCommonClubType = Object.keys(clubTypeCounts).length > 0
        ? Object.entries(clubTypeCounts).sort((a, b) => b[1] - a[1])[0][0]
        : "N/A";

      setStats({
        totalFittings,
        totalUsers,
        mostCommonFlex,
        mostCommonClubType,
      });

      if (sessionsRes.data) {
        setRecentSessions(sessionsRes.data);
      }

      setIsLoading(false);
    };

    loadStats();
  }, [user]);

  if (isLoading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Prime Swing Fits system overview and management</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Fittings</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFittings}</div>
                <p className="text-xs text-muted-foreground">Completed sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Most Common Flex</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.mostCommonFlex}</div>
                <p className="text-xs text-muted-foreground">Shaft flex recommendation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{stats.mostCommonClubType}</div>
                <p className="text-xs text-muted-foreground">Club type recommendation</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Completed Sessions</CardTitle>
                <Button variant="outline" asChild>
                  <Link href="/admin/sessions">View All Sessions</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No completed sessions yet</p>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{session.users?.email || "Unknown User"}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed: {session.completed_at ? new Date(session.completed_at).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/fitting/${session.id}/results`}>View Results</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/sessions">
              <Card className="hover:border-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Fitting Sessions
                  </CardTitle>
                  <CardDescription>
                    View and manage all fitting sessions
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/users">
              <Card className="hover:border-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user roles and subscriptions
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/rules">
              <Card className="hover:border-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Fitting Rules
                  </CardTitle>
                  <CardDescription>
                    Configure recommendation engine logic
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}