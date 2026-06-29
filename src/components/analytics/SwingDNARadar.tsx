import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Database } from "@/integrations/supabase/database.types";

type SwingDNAProfile = Database["public"]["Tables"]["swing_dna_profiles"]["Row"];

export function SwingDNARadar() {
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
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      drawRadarChart();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("swing_dna_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching Swing DNA:", error);
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