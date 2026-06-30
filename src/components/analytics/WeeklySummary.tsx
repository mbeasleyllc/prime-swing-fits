import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Target, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface WeeklySummaryProps {
  userId: string;
}

interface SwingMetric {
  club_speed: number | null;
  ball_speed: number | null;
  carry_distance: number | null;
  spin_rate: number | null;
  smash_factor: number | null;
  launch_angle: number | null;
  created_at: string;
}

interface Insight {
  type: "improvement" | "decline" | "focus" | "achievement";
  title: string;
  description: string;
  metric: string;
  change?: number;
  recommendation?: string;
}

export function WeeklySummary({ userId }: WeeklySummaryProps) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [weekStats, setWeekStats] = useState<{
    sessionsThisWeek: number;
    shotsThisWeek: number;
    primaryImprovement: string | null;
  } | null>(null);

  useEffect(() => {
    fetchWeeklyData();
  }, [userId]);

  const fetchWeeklyData = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // Fetch this week's data
      const { data: thisWeek, error: thisWeekError } = await supabase
        .from("swing_metrics")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (thisWeekError) throw thisWeekError;

      // Fetch last week's data for comparison
      const { data: lastWeek, error: lastWeekError } = await supabase
        .from("swing_metrics")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", fourteenDaysAgo.toISOString())
        .lt("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (lastWeekError) throw lastWeekError;

      // Count sessions
      const { count: sessionCount } = await supabase
        .from("swing_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("session_date", sevenDaysAgo.toISOString());

      const generatedInsights = generateInsights(
        thisWeek as SwingMetric[],
        lastWeek as SwingMetric[]
      );

      setInsights(generatedInsights);
      setWeekStats({
        sessionsThisWeek: sessionCount || 0,
        shotsThisWeek: thisWeek?.length || 0,
        primaryImprovement: generatedInsights.find(i => i.type === "improvement")?.metric || null,
      });
    } catch (error) {
      console.error("Error fetching weekly data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (
    thisWeek: SwingMetric[],
    lastWeek: SwingMetric[]
  ): Insight[] => {
    const insights: Insight[] = [];

    if (thisWeek.length === 0) {
      return [{
        type: "focus",
        title: "No Practice This Week",
        description: "Start building your swing data history to unlock AI insights.",
        metric: "activity",
        recommendation: "Log at least 10 shots this week to get your first insights.",
      }];
    }

    if (lastWeek.length === 0) {
      return [{
        type: "achievement",
        title: "Welcome to Weekly Insights!",
        description: "Keep logging swing data for personalized improvement tracking.",
        metric: "onboarding",
        recommendation: "Complete 2 more sessions this week to establish your baseline.",
      }];
    }

    // Calculate averages
    const thisWeekAvg = calculateAverages(thisWeek);
    const lastWeekAvg = calculateAverages(lastWeek);

    // Club speed analysis
    if (thisWeekAvg.clubSpeed && lastWeekAvg.clubSpeed) {
      const speedChange = ((thisWeekAvg.clubSpeed - lastWeekAvg.clubSpeed) / lastWeekAvg.clubSpeed) * 100;
      if (Math.abs(speedChange) > 2) {
        insights.push({
          type: speedChange > 0 ? "improvement" : "decline",
          title: speedChange > 0 ? "Club Speed Gaining Momentum" : "Club Speed Needs Attention",
          description: `Your average club speed ${speedChange > 0 ? "increased" : "decreased"} by ${Math.abs(speedChange).toFixed(1)}% this week (${thisWeekAvg.clubSpeed.toFixed(1)} mph vs ${lastWeekAvg.clubSpeed.toFixed(1)} mph).`,
          metric: "club_speed",
          change: speedChange,
          recommendation: speedChange > 0 
            ? "Maintain this tempo in your next session. Consider adding resistance training."
            : "Focus on tempo and rhythm. Review your grip pressure and swing path.",
        });
      }
    }

    // Carry distance analysis
    if (thisWeekAvg.carryDistance && lastWeekAvg.carryDistance) {
      const distanceChange = ((thisWeekAvg.carryDistance - lastWeekAvg.carryDistance) / lastWeekAvg.carryDistance) * 100;
      if (Math.abs(distanceChange) > 3) {
        insights.push({
          type: distanceChange > 0 ? "improvement" : "decline",
          title: distanceChange > 0 ? "Distance on the Rise" : "Distance Regression",
          description: `Carry distance ${distanceChange > 0 ? "improved" : "dropped"} by ${Math.abs(distanceChange).toFixed(1)}% (${thisWeekAvg.carryDistance.toFixed(0)} yds vs ${lastWeekAvg.carryDistance.toFixed(0)} yds).`,
          metric: "carry_distance",
          change: distanceChange,
          recommendation: distanceChange > 0
            ? "Excellent! Focus on maintaining this strike quality."
            : "Check your impact position and ball striking consistency.",
        });
      }
    }

    // Smash factor consistency
    if (thisWeekAvg.smashFactor && lastWeekAvg.smashFactor) {
      const smashChange = ((thisWeekAvg.smashFactor - lastWeekAvg.smashFactor) / lastWeekAvg.smashFactor) * 100;
      if (thisWeekAvg.smashFactor < 1.40 && lastWeekAvg.smashFactor < 1.40) {
        insights.push({
          type: "focus",
          title: "Strike Quality Opportunity",
          description: `Your smash factor average of ${thisWeekAvg.smashFactor.toFixed(2)} indicates room for improvement in center-face contact.`,
          metric: "smash_factor",
          change: smashChange,
          recommendation: "Focus on center-face contact. Optimal smash factor for driver is 1.48-1.50.",
        });
      } else if (smashChange > 1) {
        insights.push({
          type: "improvement",
          title: "Strike Quality Improving",
          description: `Smash factor improved to ${thisWeekAvg.smashFactor.toFixed(2)}, showing better center-face contact.`,
          metric: "smash_factor",
          change: smashChange,
          recommendation: "Keep up this ball-striking form. You're maximizing energy transfer.",
        });
      }
    }

    // Spin rate analysis (for driver)
    if (thisWeekAvg.spinRate && lastWeekAvg.spinRate) {
      const optimalSpin = 2500; // Optimal driver spin
      const spinDiff = Math.abs(thisWeekAvg.spinRate - optimalSpin);
      
      if (spinDiff > 500 && spinDiff < Math.abs(lastWeekAvg.spinRate - optimalSpin)) {
        insights.push({
          type: "improvement",
          title: "Spin Rate Optimizing",
          description: `Your spin rate moved closer to optimal (${thisWeekAvg.spinRate.toFixed(0)} rpm, target: 2000-2800 rpm).`,
          metric: "spin_rate",
          recommendation: "Continue working on your attack angle and dynamic loft.",
        });
      } else if (thisWeekAvg.spinRate > 3000) {
        insights.push({
          type: "focus",
          title: "High Spin Rate Detected",
          description: `Average spin of ${thisWeekAvg.spinRate.toFixed(0)} rpm may be costing you distance.`,
          metric: "spin_rate",
          recommendation: "Lower tee height, move ball position forward, and shallow out your attack angle.",
        });
      }
    }

    // Launch angle analysis
    if (thisWeekAvg.launchAngle && lastWeekAvg.launchAngle) {
      const optimalLaunch = 12.5; // Optimal driver launch
      const launchDiff = Math.abs(thisWeekAvg.launchAngle - optimalLaunch);
      
      if (launchDiff < 2) {
        insights.push({
          type: "achievement",
          title: "Optimal Launch Angle",
          description: `You're consistently launching at ${thisWeekAvg.launchAngle.toFixed(1)}°, near the optimal 11-14° range.`,
          metric: "launch_angle",
          recommendation: "Maintain this setup and attack angle. Your launch conditions are dialed in.",
        });
      }
    }

    // Consistency insight
    const consistency = calculateConsistency(thisWeek);
    if (consistency < 70) {
      insights.push({
        type: "focus",
        title: "Consistency Challenge",
        description: `Your shot-to-shot variance is ${consistency.toFixed(0)}%. Focus on repeatable mechanics.`,
        metric: "consistency",
        recommendation: "Practice with alignment sticks and focus on tempo rather than power.",
      });
    } else if (consistency > 85) {
      insights.push({
        type: "achievement",
        title: "High Consistency Achieved",
        description: `Impressive ${consistency.toFixed(0)}% consistency score. Your swing is repeatable.`,
        metric: "consistency",
        recommendation: "With this consistency, you can start working on fine-tuning for distance.",
      });
    }

    // Volume milestone
    if (thisWeek.length >= 50) {
      insights.push({
        type: "achievement",
        title: "Volume Milestone",
        description: `You logged ${thisWeek.length} shots this week! Consistent practice is key.`,
        metric: "volume",
        recommendation: "This volume shows serious dedication. Keep tracking to see long-term trends.",
      });
    }

    return insights.slice(0, 4); // Return top 4 insights
  };

  const calculateAverages = (metrics: SwingMetric[]) => {
    const valid = metrics.filter(m => m.club_speed && m.ball_speed);
    if (valid.length === 0) return {};

    return {
      clubSpeed: valid.reduce((sum, m) => sum + (m.club_speed || 0), 0) / valid.length,
      ballSpeed: valid.reduce((sum, m) => sum + (m.ball_speed || 0), 0) / valid.length,
      carryDistance: valid.reduce((sum, m) => sum + (m.carry_distance || 0), 0) / valid.length,
      spinRate: valid.reduce((sum, m) => sum + (m.spin_rate || 0), 0) / valid.length,
      smashFactor: valid.reduce((sum, m) => sum + (m.smash_factor || 0), 0) / valid.length,
      launchAngle: valid.reduce((sum, m) => sum + (m.launch_angle || 0), 0) / valid.length,
    };
  };

  const calculateConsistency = (metrics: SwingMetric[]): number => {
    const speeds = metrics.map(m => m.club_speed).filter(Boolean) as number[];
    if (speeds.length < 3) return 0;

    const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - avg, 2), 0) / speeds.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / avg) * 100;

    return Math.max(0, 100 - coefficientOfVariation * 2);
  };

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "improvement":
        return <TrendingUp className="h-5 w-5 text-accent" />;
      case "decline":
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      case "focus":
        return <Target className="h-5 w-5 text-gold" />;
      case "achievement":
        return <Sparkles className="h-5 w-5 text-accent" />;
    }
  };

  const getInsightBadgeVariant = (type: Insight["type"]) => {
    switch (type) {
      case "improvement":
      case "achievement":
        return "default";
      case "decline":
        return "destructive";
      case "focus":
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              AI Weekly Summary
            </CardTitle>
            <CardDescription className="mt-1">
              Personalized insights from your last 7 days of swing data
            </CardDescription>
          </div>
          {weekStats && (
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">{weekStats.sessionsThisWeek}</div>
              <div className="text-xs text-muted-foreground">sessions</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Log swing data to receive AI-powered weekly insights
            </p>
            <Button asChild size="sm">
              <Link href="/swing-data/import">
                Import Swing Data
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                        {insight.metric.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    {insight.recommendation && (
                      <div className="flex items-start gap-2 mt-3 pt-3 border-t">
                        <ArrowRight className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-foreground font-medium">
                          {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Insights refresh every Monday at 6 AM
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/swing-analytics">
                  View Full Analytics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}