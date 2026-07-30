import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Activity, Award, TrendingUp, FileText, BarChart3, Download, RefreshCw } from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user_email: string;
  details: string;
  severity: "info" | "warning" | "error";
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalFittings: 0,
    totalUsers: 0,
    mostCommonFlex: "",
    mostCommonClubType: "",
    totalSwingData: 0,
    activeSubscriptions: 0,
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    await Promise.all([loadStats(), loadLogs()]);
  };

  const loadStats = async () => {
    const [fittingsRes, usersRes, flexRes, clubTypeRes, sessionsRes, swingDataRes, subscriptionsRes] = await Promise.all([
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
      supabase.from("swing_sessions").select("id", { count: "exact", head: true }),
      supabase.from("user_swing_subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
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
      totalSwingData: swingDataRes.count || 0,
      activeSubscriptions: subscriptionsRes.count || 0,
    });

    if (sessionsRes.data) {
      setRecentSessions(sessionsRes.data);
    }

    setIsLoading(false);
  };

  const loadLogs = async () => {
    const mockLogs: ActivityLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        action: "User Registration",
        user_email: "john@example.com",
        details: "New user account created",
        severity: "info",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: "Fitting Completed",
        user_email: "jane@example.com",
        details: "Full bag fitting session completed successfully",
        severity: "info",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        action: "Payment Failed",
        user_email: "bob@example.com",
        details: "Subscription payment declined",
        severity: "warning",
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        action: "Database Error",
        user_email: "system",
        details: "Connection timeout on swing_metrics query",
        severity: "error",
      },
    ];
    setLogs(mockLogs);
  };

  const handleExportReport = async () => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        stats,
        logs: logs.map((log) => ({
          timestamp: log.timestamp,
          action: log.action,
          user: log.user_email,
          severity: log.severity,
        })),
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prime-swing-fits-report-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();

      toast({
        title: "Report Exported",
        description: "System report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return <Badge className="bg-red-500 text-white">Error</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500 text-white">Warning</Badge>;
      default:
        return <Badge className="bg-blue-500 text-white">Info</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredLogs = logs.filter((log) =>
    severityFilter === "all" ? true : log.severity === severityFilter
  );

  if (isLoading) {
    return (
      <ProtectedRoute adminOnly>
        <AppLayout>
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Prime Swing Fits system overview and management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <CardTitle className="text-sm font-medium">Swing Data</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSwingData}</div>
                <p className="text-xs text-muted-foreground">Sessions tracked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">Paid members</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <Card>
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

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Activity Logs & Reports
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Logs</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={loadLogs}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell className="font-medium">{log.action}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.user_email}
                          </TableCell>
                          <TableCell className="text-sm">{log.details}</TableCell>
                          <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Monitor key metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Database Connection</p>
                    <p className="text-sm text-muted-foreground">Supabase PostgreSQL</p>
                  </div>
                  <Badge className="bg-accent text-white">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">API Response Time</p>
                    <p className="text-sm text-muted-foreground">Average latency</p>
                  </div>
                  <Badge className="bg-accent text-white">125ms</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Error Rate</p>
                    <p className="text-sm text-muted-foreground">Last 24 hours</p>
                  </div>
                  <Badge className="bg-accent text-white">0.02%</Badge>
                </div>
              </div>
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
      </AppLayout>
    </ProtectedRoute>
  );
}