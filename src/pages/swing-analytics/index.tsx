import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SwingDNARadar } from "@/components/analytics/SwingDNARadar";
import { ProgressCharts } from "@/components/analytics/ProgressCharts";
import { TrendingUp, TrendingDown, Target, Calendar, Download, Upload, Plus, Eye, Filter, Activity } from "lucide-react";
import { checkSwingAnalyticsAccess } from "@/lib/subscriptionMiddleware";
import { UpgradeModal } from "@/components/swing-analytics/UpgradeModal";
import type { Database } from "@/integrations/supabase/database.types";

type SwingSession = Database["public"]["Tables"]["swing_sessions"]["Row"];

export default function SwingAnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SwingSession[]>([]);
  const [latestSession, setLatestSession] = useState<SwingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [userTier, setUserTier] = useState<"entry" | "core" | "premium">("core");
  const [blockReason, setBlockReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    club: "",
    device: "",
  });
  const [kpis, setKpis] = useState({
    consistencyScore: 0,
    trend30Days: 0,
    bestSpeed: 0,
    totalSessions: 0,
  });

  const itemsPerPage = 20;

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (!accessBlocked) {
      fetchSessions();
      calculateKPIs();
    }
  }, [currentPage, filters, accessBlocked]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const access = await checkSwingAnalyticsAccess(user.id);
      
      if (!access.hasAccess) {
        setAccessBlocked(true);
        setBlockReason(access.blockReason || "Upgrade required");
        
        // Determine user tier for upgrade modal
        const { data: userData } = await supabase
          .from("users")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();
        
        const tier = userData?.subscription_tier as "entry" | "core" | "premium" || "core";
        setUserTier(tier);
        setShowUpgradeModal(true);
        setLoading(false);
        return;
      }
      
      setAccessBlocked(false);
    } catch (error) {
      console.error("Access check error:", error);
      setAccessBlocked(true);
      setShowUpgradeModal(true);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      let query = supabase
        .from("swing_sessions")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("session_date", { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (filters.startDate) {
        query = query.gte("session_date", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("session_date", filters.endDate);
      }
      if (filters.device) {
        query = query.eq("device_type", filters.device);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setSessions(data ?? []);
      setTotalPages(Math.ceil((count ?? 0) / itemsPerPage));
      
      // Set latest session for DNA radar
      if (data && data.length > 0) {
        setLatestSession(data[0]);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all sessions for calculations
      const { data: allSessions } = await supabase
        .from("swing_sessions")
        .select("*")
        .eq("user_id", user.id);

      if (!allSessions || allSessions.length === 0) return;

      // Total sessions
      const totalSessions = allSessions.length;

      // Consistency score (based on standard deviation of club speeds)
      const speeds = allSessions.map(s => s.avg_club_speed).filter(s => s !== null) as number[];
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const stdDev = Math.sqrt(speeds.reduce((sq, n) => sq + Math.pow(n - avgSpeed, 2), 0) / speeds.length);
      const consistencyScore = Math.max(0, 100 - (stdDev / avgSpeed) * 100);

      // Best speed
      const bestSpeed = Math.max(...speeds);

      // 30-day trend
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSessions = allSessions.filter(s => new Date(s.session_date) >= thirtyDaysAgo);
      const oldSessions = allSessions.filter(s => new Date(s.session_date) < thirtyDaysAgo);
      
      if (recentSessions.length > 0 && oldSessions.length > 0) {
        const recentAvg = recentSessions.reduce((sum, s) => sum + (s.avg_club_speed ?? 0), 0) / recentSessions.length;
        const oldAvg = oldSessions.reduce((sum, s) => sum + (s.avg_club_speed ?? 0), 0) / oldSessions.length;
        const trend30Days = ((recentAvg - oldAvg) / oldAvg) * 100;
        setKpis({ consistencyScore, trend30Days, bestSpeed, totalSessions });
      } else {
        setKpis({ consistencyScore, trend30Days: 0, bestSpeed, totalSessions });
      }
    } catch (error) {
      console.error("Error calculating KPIs:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AppLayout>
      <SEO
        title="Swing Analytics - Prime Swing Fits"
        description="Analyze your swing data with comprehensive analytics and insights"
      />
      
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          if (accessBlocked) {
            router.push("/dashboard");
          }
        }}
        currentTier={userTier}
        blockReason={blockReason}
      />

      {accessBlocked ? (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Access restricted. Please upgrade to view analytics.</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Swing Analytics</h1>
              <p className="text-muted-foreground mt-1">Track your progress and analyze your swing data</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/swing-data/import">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Link>
              </Button>
              <Button asChild>
                <Link href="/swing-data/import">
                  <Plus className="w-4 h-4 mr-2" />
                  Manual Entry
                </Link>
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Consistency Score</CardDescription>
                <CardTitle className="text-3xl">{kpis.consistencyScore.toFixed(1)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <Target className="w-4 h-4 mr-1 text-success" />
                  <span className="text-muted-foreground">Based on speed variance</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>30-Day Trend</CardDescription>
                <CardTitle className="text-3xl flex items-center">
                  {kpis.trend30Days > 0 ? "+" : ""}{kpis.trend30Days.toFixed(1)}%
                  {kpis.trend30Days > 0 ? (
                    <TrendingUp className="w-5 h-5 ml-2 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 ml-2 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">vs previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Best Club Speed</CardDescription>
                <CardTitle className="text-3xl">{kpis.bestSpeed.toFixed(1)} mph</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Personal record</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Sessions</CardDescription>
                <CardTitle className="text-3xl">{kpis.totalSessions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">All-time tracking</div>
              </CardContent>
            </Card>
          </div>

          {/* Swing DNA Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-success" />
                Your Swing DNA Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestSession ? (
                <SwingDNARadar
                  data={{
                    club_speed_mph: latestSession.avg_club_speed,
                    ball_speed_mph: latestSession.avg_ball_speed,
                    launch_angle_deg: latestSession.avg_launch_angle,
                    spin_rate_rpm: latestSession.avg_spin_rate,
                    carry_distance_yds: latestSession.avg_carry_distance,
                    consistency_score: latestSession.consistency_score,
                  }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Complete a swing session to see your DNA profile
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Charts */}
          <ProgressCharts />

          {/* Session History */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Session History</CardTitle>
                  <CardDescription>View and analyze your swing sessions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
                <Select
                  value={filters.club || undefined}
                  onValueChange={(value) => setFilters({ ...filters, club: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Clubs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Driver">Driver</SelectItem>
                    <SelectItem value="3-Wood">3-Wood</SelectItem>
                    <SelectItem value="5-Wood">5-Wood</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Iron">Iron</SelectItem>
                    <SelectItem value="Wedge">Wedge</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.device || undefined}
                  onValueChange={(value) => setFilters({ ...filters, device: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Devices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="golf_daddy">Golf Daddy</SelectItem>
                    <SelectItem value="trackman">TrackMan</SelectItem>
                    <SelectItem value="flightscope">FlightScope</SelectItem>
                    <SelectItem value="garmin">Garmin</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No sessions found</p>
                  <Button asChild>
                    <Link href="/swing-data/import">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Session
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Date</TableHead>
                          <TableHead className="min-w-[120px]">Club</TableHead>
                          <TableHead className="min-w-[100px]">Device</TableHead>
                          <TableHead className="text-right min-w-[60px]">Shots</TableHead>
                          <TableHead className="text-right min-w-[100px]">Avg Speed</TableHead>
                          <TableHead className="text-right min-w-[110px]">Avg Distance</TableHead>
                          <TableHead className="min-w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map((session) => (
                          <TableRow key={session.id} className="touch-manipulation">
                            <TableCell className="font-medium">{formatDate(session.session_date)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{session.session_name || "Session"}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {session.device_type}
                            </TableCell>
                            <TableCell className="text-right font-medium">{session.total_shots}</TableCell>
                            <TableCell className="text-right">
                              {session.avg_club_speed ? `${session.avg_club_speed.toFixed(1)} mph` : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {session.avg_carry_distance ? `${session.avg_carry_distance.toFixed(0)} yds` : "-"}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0" asChild>
                                <Link href={`/swing-analytics/${session.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="min-h-[44px]"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="min-h-[44px]"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}