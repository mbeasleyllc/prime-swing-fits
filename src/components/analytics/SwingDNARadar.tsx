import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SwingDNAProfile {
  power_score: number;
  consistency_score: number;
  efficiency_score: number;
  launch_score: number;
  spin_control_score: number;
  accuracy_score: number;
}

interface SwingDNARadarProps {
  data: {
    club_speed_mph: number | null;
    ball_speed_mph: number | null;
    launch_angle_deg: number | null;
    spin_rate_rpm: number | null;
    carry_distance_yds: number | null;
    consistency_score: number | null;
  };
}

export function SwingDNARadar({ data }: SwingDNARadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [profile, setProfile] = useState<SwingDNAProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const attributes = [
    { key: "power_score", label: "Power", benchmark: 75 },
    { key: "consistency_score", label: "Consistency", benchmark: 70 },
    { key: "efficiency_score", label: "Efficiency", benchmark: 72 },
    { key: "launch_score", label: "Launch", benchmark: 68 },
    { key: "spin_control_score", label: "Spin Control", benchmark: 65 },
    { key: "accuracy_score", label: "Accuracy", benchmark: 70 },
  ] as const;

  useEffect(() => {
    fetchAndCalculateProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      drawRadarChart();
    }
  }, [profile]);

  const fetchAndCalculateProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all swing metrics for the user
      const { data: metrics, error } = await supabase
        .from("swing_metrics")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      if (!metrics || metrics.length === 0) {
        setProfile(null);
        return;
      }

      // Calculate DNA scores
      const validMetrics = metrics.filter(m => 
        m.club_speed && m.ball_speed && m.carry_distance
      );

      if (validMetrics.length === 0) {
        setProfile(null);
        return;
      }

      // Power Score: based on average club speed
      const avgSpeed = validMetrics.reduce((sum, m) => sum + (m.club_speed ?? 0), 0) / validMetrics.length;
      const powerScore = Math.min(100, (avgSpeed / 120) * 100);

      // Consistency Score: based on standard deviation of speeds
      const speedStdDev = Math.sqrt(
        validMetrics.reduce((sq, m) => sq + Math.pow((m.club_speed ?? 0) - avgSpeed, 2), 0) / validMetrics.length
      );
      const consistencyScore = Math.max(0, 100 - (speedStdDev / avgSpeed) * 100);

      // Efficiency Score: based on smash factor
      const avgSmash = validMetrics.reduce((sum, m) => sum + (m.smash_factor ?? 0), 0) / validMetrics.length;
      const efficiencyScore = Math.min(100, (avgSmash / 1.5) * 100);

      // Launch Score: based on launch angle optimality (10-14° ideal)
      const avgLaunch = validMetrics.reduce((sum, m) => sum + (m.launch_angle ?? 0), 0) / validMetrics.length;
      const launchDeviation = Math.abs(avgLaunch - 12);
      const launchScore = Math.max(0, 100 - (launchDeviation * 10));

      // Spin Control Score: based on spin rate consistency
      const spinRates = validMetrics.map(m => m.spin_rate ?? 0).filter(s => s > 0);
      const avgSpin = spinRates.reduce((a, b) => a + b, 0) / spinRates.length;
      const spinStdDev = Math.sqrt(
        spinRates.reduce((sq, s) => sq + Math.pow(s - avgSpin, 2), 0) / spinRates.length
      );
      const spinScore = Math.max(0, 100 - (spinStdDev / avgSpin) * 50);

      // Accuracy Score: based on offline distance variance
      const offlineDistances = validMetrics.map(m => Math.abs(m.launch_direction ?? 0));
      const avgOffline = offlineDistances.reduce((a, b) => a + b, 0) / offlineDistances.length;
      const accuracyScore = Math.max(0, 100 - (avgOffline * 2));

      setProfile({
        power_score: powerScore,
        consistency_score: consistencyScore,
        efficiency_score: efficiencyScore,
        launch_score: launchScore,
        spin_control_score: spinScore,
        accuracy_score: accuracyScore,
      });
    } catch (error) {
      console.error("Error calculating Swing DNA:", error);
    } finally {
      setLoading(false);
    }
  };

  const drawRadarChart = () => {
    if (!canvasRef.current || !profile) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const size = Math.min(canvas.parentElement?.clientWidth ?? 400, 400);
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background circles
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw axes
    const angleStep = (Math.PI * 2) / attributes.length;
    attributes.forEach((attr, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#e5e7eb";
      ctx.stroke();

      // Draw labels
      const labelX = centerX + Math.cos(angle) * (radius + 30);
      const labelY = centerY + Math.sin(angle) * (radius + 30);
      ctx.fillStyle = "#000";
      ctx.font = "600 12px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(attr.label, labelX, labelY);
    });

    // Draw benchmark polygon (PGA Tour average)
    ctx.beginPath();
    attributes.forEach((attr, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const value = attr.benchmark / 100;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw user data polygon
    ctx.beginPath();
    attributes.forEach((attr, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const value = (profile[attr.key] ?? 0) / 100;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
    ctx.fill();
    ctx.strokeStyle = "#22C55E";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw value points
    attributes.forEach((attr, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const value = (profile[attr.key] ?? 0) / 100;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#22C55E";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const exportChart = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "swing-dna-profile.png";
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Export Successful",
        description: "Swing DNA profile image downloaded",
      });
    });
  };

  const getScoreColor = (value: number, benchmark: number) => {
    const diff = value - benchmark;
    if (diff > 5) return "text-green-600";
    if (diff < -5) return "text-red-600";
    return "text-yellow-600";
  };

  const getScoreIcon = (value: number, benchmark: number) => {
    const diff = value - benchmark;
    if (diff > 5) return <TrendingUp className="w-4 h-4" />;
    if (diff < -5) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Swing DNA Profile</CardTitle>
          <CardDescription>Loading your swing characteristics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Swing DNA Profile</CardTitle>
          <CardDescription>No profile data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Complete more sessions to generate your Swing DNA profile
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Swing DNA Profile</CardTitle>
            <CardDescription>Your unique swing characteristics analyzed</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportChart}>
            <Download className="w-4 h-4 mr-2" />
            Export Image
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>

          {/* Attribute Breakdown */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Attribute Breakdown</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Compared to PGA Tour average (dashed line)
              </p>
            </div>

            {attributes.map((attr) => {
              const value = profile[attr.key] ?? 0;
              const diff = value - attr.benchmark;
              return (
                <div key={attr.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={getScoreColor(value, attr.benchmark)}>
                      {getScoreIcon(value, attr.benchmark)}
                    </div>
                    <div>
                      <div className="font-medium">{attr.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)} vs benchmark
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{value.toFixed(0)}</div>
                    <Badge
                      variant={
                        diff > 5 ? "default" :
                        diff < -5 ? "destructive" :
                        "secondary"
                      }
                      className="mt-1"
                    >
                      {diff > 5 ? "Above Avg" : diff < -5 ? "Needs Work" : "Average"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}