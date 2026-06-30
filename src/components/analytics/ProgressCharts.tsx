import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/database.types";

type SwingMetric = Database["public"]["Tables"]["swing_metrics"]["Row"];

export function ProgressCharts() {
  const [shots, setShots] = useState<SwingMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const speedChartRef = useRef<HTMLCanvasElement>(null);
  const distanceChartRef = useRef<HTMLCanvasElement>(null);
  const consistencyChartRef = useRef<HTMLCanvasElement>(null);
  const launchChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchShots();
  }, []);

  useEffect(() => {
    if (shots.length > 0) {
      drawSpeedChart();
      drawDistanceChart();
      drawConsistencyChart();
      drawLaunchMatrix();
    }
  }, [shots]);

  const fetchShots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get count first to determine strategy
      const { count } = await supabase
        .from("swing_metrics")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      let data;
      
      // For large datasets (500+ shots), fetch only last 90 days for performance
      if (count && count > 500) {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const { data: recentData, error } = await supabase
          .from("swing_metrics")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", ninetyDaysAgo.toISOString())
          .order("created_at", { ascending: true })
          .limit(500);

        if (error) throw error;
        data = recentData;
      } else {
        // Fetch all for smaller datasets
        const { data: allData, error } = await supabase
          .from("swing_metrics")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        data = allData;
      }

      setShots(data ?? []);
    } catch (error) {
      console.error("Error fetching shots:", error);
    } finally {
      setLoading(false);
    }
  };

  const drawSpeedChart = () => {
    if (!speedChartRef.current || shots.length === 0) return;

    const canvas = speedChartRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parentWidth = canvas.parentElement?.clientWidth ?? 600;
    const isMobile = parentWidth < 640;
    const width = Math.min(parentWidth, 800);
    const height = isMobile ? 250 : 300;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const padding = isMobile ? 40 : 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const speeds = shots.map(s => s.club_speed ?? 0).filter(s => s > 0);
    const maxSpeed = Math.max(...speeds);
    const minSpeed = Math.min(...speeds);
    const speedRange = maxSpeed - minSpeed || 1;

    // Draw axes
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.strokeStyle = "#f3f4f6";
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y-axis labels
      const value = maxSpeed - (speedRange / 5) * i;
      ctx.fillStyle = "#6b7280";
      ctx.font = isMobile ? "10px Inter" : "12px Inter";
      ctx.textAlign = "right";
      ctx.fillText(value.toFixed(0), padding - 5, y + 4);
    }

    // Draw data points and line
    ctx.strokeStyle = "#2D6A4F";
    ctx.fillStyle = "#2D6A4F";
    ctx.lineWidth = 2;
    ctx.beginPath();

    speeds.forEach((speed, i) => {
      const x = padding + (chartWidth / (speeds.length - 1)) * i;
      const y = height - padding - ((speed - minSpeed) / speedRange) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw point - larger on mobile for touch
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, isMobile ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.stroke();

    // Draw trend line
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const y = height - padding - ((avgSpeed - minSpeed) / speedRange) * chartHeight;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#C9A84C";
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Title
    ctx.fillStyle = "#000";
    ctx.font = isMobile ? "600 12px Inter" : "600 14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Club Speed Over Time", width / 2, 20);
  };

  const drawDistanceChart = () => {
    if (!distanceChartRef.current || shots.length === 0) return;

    const canvas = distanceChartRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth ?? 600;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const carryDistances = shots.map(s => s.carry_distance ?? 0).filter(d => d > 0);
    const totalDistances = shots.map(s => s.total_distance ?? 0).filter(d => d > 0);
    const maxDistance = Math.max(...carryDistances, ...totalDistances);

    // Draw axes
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw carry distance line
    ctx.strokeStyle = "#2D6A4F";
    ctx.lineWidth = 2;
    ctx.beginPath();
    carryDistances.forEach((dist, i) => {
      const x = padding + (chartWidth / (carryDistances.length - 1)) * i;
      const y = height - padding - (dist / maxDistance) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw total distance line
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    totalDistances.forEach((dist, i) => {
      const x = padding + (chartWidth / (totalDistances.length - 1)) * i;
      const y = height - padding - (dist / maxDistance) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Legend
    ctx.fillStyle = "#2D6A4F";
    ctx.fillRect(padding, 30, 15, 3);
    ctx.fillStyle = "#000";
    ctx.font = "12px Inter";
    ctx.textAlign = "left";
    ctx.fillText("Carry", padding + 20, 33);

    ctx.fillStyle = "#C9A84C";
    ctx.fillRect(padding + 80, 30, 15, 3);
    ctx.fillStyle = "#000";
    ctx.fillText("Total", padding + 100, 33);

    // Title
    ctx.fillStyle = "#000";
    ctx.font = "600 14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Distance Progression", width / 2, 20);
  };

  const drawConsistencyChart = () => {
    if (!consistencyChartRef.current || shots.length === 0) return;

    const canvas = consistencyChartRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth ?? 600;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate variance over rolling window
    const windowSize = 10;
    const variances: number[] = [];
    
    for (let i = windowSize; i < shots.length; i++) {
      const window = shots.slice(i - windowSize, i);
      const speeds = window.map(s => s.club_speed ?? 0).filter(s => s > 0);
      const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const variance = Math.sqrt(speeds.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / speeds.length);
      variances.push(variance);
    }

    if (variances.length === 0) return;

    const maxVariance = Math.max(...variances);

    // Draw axes
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw variance line
    ctx.strokeStyle = "#2D6A4F";
    ctx.lineWidth = 2;
    ctx.beginPath();
    variances.forEach((variance, i) => {
      const x = padding + (chartWidth / (variances.length - 1)) * i;
      const y = height - padding - (variance / maxVariance) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Title
    ctx.fillStyle = "#000";
    ctx.font = "600 14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Consistency Tracker (Lower is Better)", width / 2, 20);
  };

  const drawLaunchMatrix = () => {
    if (!launchChartRef.current || shots.length === 0) return;

    const canvas = launchChartRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth ?? 600;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const validShots = shots.filter(s => s.launch_angle && s.spin_rate);
    if (validShots.length === 0) return;

    const launchAngles = validShots.map(s => s.launch_angle as number);
    const spinRates = validShots.map(s => s.spin_rate as number);

    const maxLaunch = Math.max(...launchAngles);
    const minLaunch = Math.min(...launchAngles);
    const maxSpin = Math.max(...spinRates);
    const minSpin = Math.min(...spinRates);

    // Draw axes
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw scatter points
    validShots.forEach(shot => {
      const x = padding + ((shot.launch_angle! - minLaunch) / (maxLaunch - minLaunch)) * chartWidth;
      const y = height - padding - ((shot.spin_rate! - minSpin) / (maxSpin - minSpin)) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(45, 106, 79, 0.6)";
      ctx.fill();
      ctx.strokeStyle = "#C9A84C";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Axis labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Launch Angle (°)", width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Spin Rate (rpm)", 0, 0);
    ctx.restore();

    // Title
    ctx.fillStyle = "#000";
    ctx.font = "600 14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Launch Conditions Matrix", width / 2, 20);
  };

  if (loading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Progress Charts</CardTitle>
          <CardDescription>Loading your swing data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (shots.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Progress Charts</CardTitle>
          <CardDescription>No shot data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Add swing sessions to see progress charts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Progress Charts</CardTitle>
        <CardDescription>Track your improvement over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="speed" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="speed">Club Speed</TabsTrigger>
            <TabsTrigger value="distance">Distance</TabsTrigger>
            <TabsTrigger value="consistency">Consistency</TabsTrigger>
            <TabsTrigger value="launch">Launch</TabsTrigger>
          </TabsList>

          <TabsContent value="speed" className="mt-6">
            <canvas ref={speedChartRef} className="w-full" />
          </TabsContent>

          <TabsContent value="distance" className="mt-6">
            <canvas ref={distanceChartRef} className="w-full" />
          </TabsContent>

          <TabsContent value="consistency" className="mt-6">
            <canvas ref={consistencyChartRef} className="w-full" />
          </TabsContent>

          <TabsContent value="launch" className="mt-6">
            <canvas ref={launchChartRef} className="w-full" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}