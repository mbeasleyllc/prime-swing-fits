import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeviceIntegrationService } from "@/lib/deviceIntegration/deviceService";
import { CSVImport } from "@/components/swing-data/CSVImport";
import { ManualEntry } from "@/components/swing-data/ManualEntry";
import type { SwingDataPoint } from "@/lib/deviceIntegration/types";
import { RefreshCw, Download, Upload, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SwingDataImport() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [swingData, setSwingData] = useState<SwingDataPoint[]>([]);
  const [connections, setConnections] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setUserId(session.user.id);
    await loadData(session.user.id);
  };

  const loadData = async (uid: string) => {
    setLoading(true);
    try {
      const [dataPoints, deviceConnections] = await Promise.all([
        DeviceIntegrationService.getSwingData(uid, { limit: 50 }),
        DeviceIntegrationService.getUserConnections(uid),
      ]);
      setSwingData(dataPoints.data);
      setConnections(deviceConnections);
    } catch (error) {
      console.error("Failed to load swing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      let syncedCount = 0;
      for (const connection of connections) {
        const result = await DeviceIntegrationService.syncDevice(connection.id);
        if (result.success) {
          syncedCount++;
        }
      }
      
      toast({
        title: "Sync Complete",
        description: `Synced data from ${syncedCount} device(s)`,
      });
      
      await loadData(userId);
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading swing data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Swing Data Import</h1>
          <p className="text-muted-foreground">
            Import and manage your swing data from connected devices or CSV files
          </p>
        </div>

        {/* Device Sync Status */}
        {connections.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connected Devices</CardTitle>
                  <CardDescription>
                    {connections.length} device(s) connected and syncing
                  </CardDescription>
                </div>
                <Button onClick={handleSync} disabled={syncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync Now"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {connections.map(conn => (
                  <div key={conn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-medium">{conn.provider.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Last sync: {conn.last_sync_at ? formatDate(conn.last_sync_at) : "Never"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={conn.connection_status === "active" ? "default" : "secondary"}>
                      {conn.connection_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Tabs */}
        <Tabs defaultValue="devices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="devices">Device Data</TabsTrigger>
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          {/* Device Data Tab */}
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Swing Data</CardTitle>
                <CardDescription>
                  Latest 50 swings from your connected devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {swingData.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Swing Data Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect a device or import data to get started
                    </p>
                    <Button onClick={() => router.push("/profile/settings")}>
                      Connect Device
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Club</TableHead>
                          <TableHead>Swing Speed</TableHead>
                          <TableHead>Ball Speed</TableHead>
                          <TableHead>Launch Angle</TableHead>
                          <TableHead>Spin Rate</TableHead>
                          <TableHead>Distance</TableHead>
                          <TableHead>Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {swingData.map((swing, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-sm">
                              {formatDate(swing.recorded_at)}
                            </TableCell>
                            <TableCell className="font-medium">{swing.club_type}</TableCell>
                            <TableCell>{swing.swing_speed ? `${swing.swing_speed} mph` : "—"}</TableCell>
                            <TableCell>{swing.ball_speed ? `${swing.ball_speed} mph` : "—"}</TableCell>
                            <TableCell>{swing.launch_angle ? `${swing.launch_angle}°` : "—"}</TableCell>
                            <TableCell>{swing.spin_rate ? `${swing.spin_rate} rpm` : "—"}</TableCell>
                            <TableCell>{swing.carry_distance ? `${swing.carry_distance} yds` : "—"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {swing.data_source}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CSV Import Tab */}
          <TabsContent value="csv">
            <CSVImport userId={userId} onImportComplete={() => loadData(userId)} />
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual">
            <ManualEntry userId={userId} onSaveComplete={() => loadData(userId)} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}