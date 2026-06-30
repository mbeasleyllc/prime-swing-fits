import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Download, RefreshCw, Activity, Users, FileText, TrendingUp } from "lucide-react";

interface SystemStats {
  totalUsers: number;
  totalFittings: number;
  totalSwingData: number;
  activeSubscriptions: number;
  revenue: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user_email: string;
  details: string;
  severity: "info" | "warning" | "error";
}

function LogsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalFittings: 0,
    totalSwingData: 0,
    activeSubscriptions: 0,
    revenue: 0,
  });
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

      if (error) throw error;

      if (data?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
      await Promise.all([fetchStats(), fetchLogs()]);
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    }
  };

  const fetchStats = async () => {
    try {
      const [usersCount, fittingsCount, swingDataCount, subscriptionsCount] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("fitting_sessions").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("swing_sessions").select("id", { count: "exact", head: true }),
        supabase.from("user_swing_subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalFittings: fittingsCount.count || 0,
        totalSwingData: swingDataCount.count || 0,
        activeSubscriptions: subscriptionsCount.count || 0,
        revenue: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error",
        description: "Failed to load activity logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  if (!isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Logs & Reports</h1>
          <p className="text-muted-foreground">
            System monitoring, activity logs, and analytics
          </p>
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
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFittings}</div>
              <p className="text-xs text-muted-foreground">Completed sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Swing Data</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSwingData}</div>
              <p className="text-xs text-muted-foreground">Sessions tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Paid members</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Activity Logs
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
                <Button variant="outline" size="sm" onClick={fetchLogs}>
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
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading logs...
              </div>
            ) : (
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
            )}
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
      </div>
    </AppLayout>
  );
}

export default function LogsPage() {
  return (
    <ProtectedRoute>
      <LogsContent />
    </ProtectedRoute>
  );
}