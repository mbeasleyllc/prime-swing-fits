import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ExternalLink, Zap } from "lucide-react";
import { DeviceIntegrationService } from "@/lib/deviceIntegration/deviceService";
import { DeviceConnectionCard } from "./DeviceConnectionCard";
import type { DeviceConnection } from "@/lib/deviceIntegration/types";
import { useToast } from "@/hooks/use-toast";

interface DeviceSetupProps {
  userId: string;
  subscriptionTier: string | null;
}

const AVAILABLE_DEVICES = [
  {
    id: "trackman",
    name: "Trackman",
    description: "Professional launch monitor with comprehensive ball flight data",
    logo: "https://www.trackman.com/assets/images/trackman-logo.svg",
  },
  {
    id: "arccos",
    name: "Arccos Caddie",
    description: "GPS tracking with AI-powered insights and shot analytics",
    logo: "https://www.arccosgolf.com/assets/images/arccos-logo.svg",
  },
  {
    id: "shot_scope",
    name: "Shot Scope",
    description: "Performance tracking with detailed statistics and GPS",
    logo: "https://www.shotscope.com/assets/images/shot-scope-logo.svg",
  },
  {
    id: "swing_daddy",
    name: "SwingDaddy",
    description: "AI-powered swing analyzer with real-time feedback",
    logo: "https://www.swingdaddy.com/assets/images/logo.svg",
  },
];

export function DeviceSetup({ userId, subscriptionTier }: DeviceSetupProps) {
  const { toast } = useToast();
  const [connections, setConnections] = useState<DeviceConnection[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, [userId]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const [connectionsData, accessCheck] = await Promise.all([
        DeviceIntegrationService.getUserConnections(userId),
        DeviceIntegrationService.checkDeviceAccess(userId),
      ]);
      setConnections(connectionsData);
      setHasAccess(accessCheck);
    } catch (error) {
      console.error("Failed to load device connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (deviceId: string) => {
    if (!hasAccess) {
      toast({
        title: "Premium Feature",
        description: "Device integration is available for Core, Premium, and Premium Plus members",
        variant: "destructive",
      });
      return;
    }

    setConnecting(deviceId);
    try {
      const authUrl = await DeviceIntegrationService.initiateOAuth(deviceId as any);
      window.location.href = authUrl;
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
      setConnecting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const connectedDeviceIds = new Set(connections.map(c => c.provider.name));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Device Integration</h3>
        <p className="text-sm text-muted-foreground">
          Connect your golf tracking devices to automatically sync swing data and improve your fitting recommendations.
        </p>
      </div>

      {/* Tier Access Notice */}
      {!hasAccess && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Lock className="h-5 w-5" />
              Premium Feature
            </CardTitle>
            <CardDescription className="text-amber-700">
              Device integration is available for Core, Premium, and Premium Plus members. Upgrade your account to connect your devices and unlock automatic data sync.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/pricing">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Now
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connected Devices */}
      {connections.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Connected Devices</h4>
          <div className="grid gap-4">
            {connections.map(connection => (
              <DeviceConnectionCard
                key={connection.id}
                connection={connection}
                onUpdate={loadConnections}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Devices */}
      <div className="space-y-4">
        <h4 className="font-medium">Available Devices</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {AVAILABLE_DEVICES.map(device => {
            const isConnected = connectedDeviceIds.has(device.id);
            return (
              <Card key={device.id} className={isConnected ? "opacity-50" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-2xl">
                        📱
                      </div>
                      <div>
                        <CardTitle className="text-base">{device.name}</CardTitle>
                        <CardDescription className="text-sm">{device.description}</CardDescription>
                      </div>
                    </div>
                    {isConnected && <Badge variant="secondary">Connected</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleConnect(device.id)}
                    disabled={!hasAccess || isConnected || connecting === device.id}
                    className="w-full"
                    variant={isConnected ? "outline" : "default"}
                  >
                    {connecting === device.id ? (
                      "Connecting..."
                    ) : isConnected ? (
                      "Already Connected"
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect {device.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}