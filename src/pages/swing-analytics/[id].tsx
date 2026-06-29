import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, TrendingDown, Target } from "lucide-react";
import type { Database } from "@/integrations/supabase/database.types";

type SwingSession = Database["public"]["Tables"]["swing_sessions"]["Row"];
type SwingShot = Database["public"]["Tables"]["swing_shots"]["Row"];

export default function SessionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const dispersionCanvasRef = useRef<HTMLCanvasElement>(null);

  const [session, setSession] = useState<SwingSession | null>(null);
  const [shots, setShots] = useState<SwingShot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bestShot, setBestShot] = useState<SwingShot | null>(null);
  const [worstShot, setWorstShot] = useState<SwingShot | null>(null);

  useEffect(() => {
    if (id) {
      fetchSessionData();
    }
  }, [id]);

  useEffect(() => {
    if (shots.length > 0) {
      findBestWorstShots();
      drawDispersionPattern();
    }
  }, [shots]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from("swing_sessions")
        .select("*")
        .eq("id", id as string)
        .eq("user_id", user.id)
        .maybeSingle();

      if (sessionError) throw sessionError;
      if (!sessionData) {
        toast({
          title: "Session Not Found",
          description: "This session does not exist or you don't have access",
          variant: "destructive",
        });
        router.push("/swing-analytics");
        return;
      }

      setSession(sessionData);

      // Fetch shots
      const { data: shotsData, error: shotsError } = await supabase
        .from("swing_shots")
        .select("*")
        .eq("session_id", id as string)
        .order("shot_number", { ascending: true });

      if (shotsError) throw shotsError;
      setShots(shotsData ?? []);
    } catch (error) {
      console.error("Error fetching session:", error);
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const findBestWorstShots = () => {
    if (shots.length === 0) return;

    // Best shot = highest carry distance
    const best = shots.reduce((max, shot) => 
      (shot.carry_distance ?? 0) > (max.carry_distance ?? 0) ? shot : max
    );
    setBestShot(best);

    // Worst shot = lowest carry distance (excluding mishits)
    const validShots = shots.filter(s => (s.carry_distance ?? 0) > 0);
    if (validShots.length > 0) {
      const worst = validShots.reduce((min, shot) =>
        (shot.carry_distance ?? 0) < (min.carry_distance ?? 0) ? shot : min
      );
      setWorstShot(worst);
    }
  };

  const drawDispersionPattern = () => {
    if (!dispersionCanvasRef.current || shots.length === 0) return;

    const canvas = dispersionCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth ?? 400;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;

    ctx.clearRect(0, 0, width, height);

    // Draw target circles
    const circles = [0.2, 0.4, 0.6, 0.8, 1.0];
    circles.forEach((factor, i) => {
      ctx.strokeStyle = i === circles.length - 1 ? "#e5e7eb" : "#f3f4f6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * factor, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw center target
    ctx.fillStyle = "#22C55E";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scale based on max offline distance
    const offlineDistances = shots
      .map(s => Math.abs(s.offline_distance ?? 0))
      .filter(d => d > 0);
    
    if (offlineDistances.length === 0) return;

    const maxOffline = Math.max(...offlineDistances) * 1.2; // Add 20% padding

    // Draw shot dispersion
    shots.forEach(shot => {
      if (!shot.offline_distance || !shot.carry_distance) return;

      const scale = maxRadius / maxOffline;
      const x = centerX + (shot.offline_distance * scale);
      const y = centerY - (shot.carry_distance * 0.1 * scale); // Scale carry for vertical

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34, 197, 94, 0.6)";
      ctx.fill();
      ctx.strokeStyle = "#22C55E";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw axis labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Left", 20, centerY);
    ctx.fillText("Right", width - 20, centerY);
    ctx.fillText("Target", centerX, height - 10);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Session not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO
        title={`Session Details - ${formatDate(session.session_date)} - Prime Swing Fits`}
        description="Detailed swing session analysis"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/swing-analytics">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analytics
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{formatDate(session.session_date)}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{session.club_used}</Badge>
            <Badge variant="secondary">{session.device_used}</Badge>
            <Badge>{session.total_shots} shots</Badge>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Club Speed</CardDescription>
              <CardTitle className="text-2xl">
                {session.avg_club_speed?.toFixed(1) ?? "-"} mph
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Carry Distance</CardDescription>
              <CardTitle className="text-2xl">
                {session.avg_carry_distance?.toFixed(0) ?? "-"} yds
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Launch Angle</CardDescription>
              <CardTitle className="text-2xl">
                {session.avg_launch_angle?.toFixed(1) ?? "-"}°
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Spin Rate</CardDescription>
              <CardTitle className="text-2xl">
                {session.avg_spin_rate?.toFixed(0) ?? "-"} rpm
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Best/Worst Shots */}
        {(bestShot || worstShot) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {bestShot && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <CardTitle>Best Shot</CardTitle>
                  </div>
                  <CardDescription>Shot #{bestShot.shot_number}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carry Distance</span>
                    <span className="font-semibold">{bestShot.carry_distance?.toFixed(0)} yds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Club Speed</span>
                    <span className="font-semibold">{bestShot.club_speed?.toFixed(1)} mph</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {worstShot && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <CardTitle>Needs Work</CardTitle>
                  </div>
                  <CardDescription>Shot #{worstShot.shot_number}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carry Distance</span>
                    <span className="font-semibold">{worstShot.carry_distance?.toFixed(0)} yds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Club Speed</span>
                    <span className="font-semibold">{worstShot.club_speed?.toFixed(1)} mph</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Shot Dispersion Pattern */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Shot Dispersion Pattern</CardTitle>
            <CardDescription>Visual representation of shot accuracy</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <canvas ref={dispersionCanvasRef} className="max-w-full" />
          </CardContent>
        </Card>

        {/* Session Notes */}
        {session.notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{session.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Shot-by-Shot Table */}
        <Card>
          <CardHeader>
            <CardTitle>Shot-by-Shot Details</CardTitle>
            <CardDescription>Complete breakdown of every shot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead className="text-right">Speed</TableHead>
                    <TableHead className="text-right">Ball Speed</TableHead>
                    <TableHead className="text-right">Carry</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Launch</TableHead>
                    <TableHead className="text-right">Spin</TableHead>
                    <TableHead className="text-right">Offline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shots.map((shot) => (
                    <TableRow key={shot.id}>
                      <TableCell className="font-medium">{shot.shot_number}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {shot.club_speed?.toFixed(1) ?? "-"} mph
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {shot.ball_speed?.toFixed(1) ?? "-"} mph
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {shot.carry_distance?.toFixed(0) ?? "-"} yds
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {shot.total_distance?.toFixed(0) ?? "-"} yds
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {shot.launch_angle?.toFixed(1) ?? "-"}°
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {shot.spin_rate?.toFixed(0) ?? "-"} rpm
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {shot.offline_distance !== null
                          ? `${shot.offline_distance > 0 ? "R" : "L"}${Math.abs(shot.offline_distance).toFixed(0)} yds`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}