import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RefreshCw, Unplug, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import type { DeviceConnection, SyncFrequency } from "@/lib/deviceIntegration/types";
import { DeviceIntegrationService } from "@/lib/deviceIntegration/deviceService";
import { useToast } from "@/hooks/use-toast";

interface DeviceConnectionCardProps {
  connection: DeviceConnection;
  onUpdate: () => void;
}

export function DeviceConnectionCard({ connection, onUpdate }: DeviceConnectionCardProps) {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await DeviceIntegrationService.triggerManualSync(connection.id);
      toast({
        title: "Sync Started",
        description: "Your device data is being synchronized",
      });
      setTimeout(onUpdate, 2000);
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

  const handleDisconnect = async () => {
    setUpdating(true);
    try {
      await DeviceIntegrationService.disconnectDevice(connection.id);
      toast({
        title: "Device Disconnected",
        description: `${connection.provider.display_name} has been disconnected`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setShowDisconnect(false);
    }
  };

  const handleAutoSyncToggle = async (enabled: boolean) => {
    setUpdating(true);
    try {
      await DeviceIntegrationService.updateSyncSettings(connection.id, {
        auto_sync_enabled: enabled,
      });
      toast({
        title: "Settings Updated",
        description: `Auto-sync ${enabled ? "enabled" : "disabled"}`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleFrequencyChange = async (frequency: string) => {
    setUpdating(true);
    try {
      await DeviceIntegrationService.updateSyncSettings(connection.id, {
        sync_frequency: frequency,
      });
      toast({
        title: "Settings Updated",
        description: `Sync frequency set to ${frequency}`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = () => {
    switch (connection.connection_status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "error":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
      case "expired":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      case "revoked":
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="outline">{connection.connection_status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {connection.provider.logo_url && (
                <img src={connection.provider.logo_url} alt={connection.provider.display_name} className="h-10 w-10 rounded" />
              )}
              <div>
                <CardTitle>{connection.provider.display_name}</CardTitle>
                <CardDescription>
                  {connection.device_username && `Connected as ${connection.device_username}`}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {connection.error_message && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              <strong>Error:</strong> {connection.error_message}
            </div>
          )}

          {connection.last_sync_at && (
            <div className="text-sm text-muted-foreground">
              Last synced: {new Date(connection.last_sync_at).toLocaleString()}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`auto-sync-${connection.id}`}>Auto-sync</Label>
              <Switch
                id={`auto-sync-${connection.id}`}
                checked={connection.auto_sync_enabled}
                onCheckedChange={handleAutoSyncToggle}
                disabled={updating || connection.connection_status !== "active"}
              />
            </div>

            {connection.auto_sync_enabled && (
              <div className="space-y-2">
                <Label>Sync Frequency</Label>
                <Select
                  value={connection.sync_frequency}
                  onValueChange={handleFrequencyChange}
                  disabled={updating || connection.connection_status !== "active"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing || connection.connection_status !== "active"}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDisconnect(true)}
            disabled={updating}
          >
            <Unplug className="h-4 w-4 mr-1" />
            Disconnect
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDisconnect} onOpenChange={setShowDisconnect}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect {connection.provider.display_name}? Your historical data will be preserved, but no new data will be synced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} disabled={updating}>
              {updating ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}