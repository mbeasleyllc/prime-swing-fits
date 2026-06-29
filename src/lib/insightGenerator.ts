import { supabase } from "@/integrations/supabase/client";

interface SessionMetrics {
  avgClubSpeed: number;
  avgBallSpeed: number;
  avgCarryDistance: number;
  avgConsistency: number;
  sessionCount: number;
  recentTrend: "improving" | "declining" | "stable";
}

const insightTemplates = [
  {
    type: "club_speed_low",
    condition: (m: SessionMetrics) => m.avgClubSpeed < 95,
    title: "Focus on Swing Speed Development",
    description: "Your average club speed is below optimal range. Increasing swing speed can significantly boost distance.",
    recommendation: "Practice with lighter clubs and focus on acceleration through impact. Consider overspeed training 2-3x per week.",
    drillLink: "https://www.youtube.com/results?search_query=golf+swing+speed+training",
    priority: "high",
  },
  {
    type: "consistency_issue",
    condition: (m: SessionMetrics) => m.avgConsistency < 75,
    title: "Consistency Needs Attention",
    description: "Your shot dispersion shows room for improvement. More consistent contact will improve scoring.",
    recommendation: "Focus on maintaining tempo and balance. Use alignment sticks during practice to ensure consistent setup.",
    drillLink: "https://www.youtube.com/results?search_query=golf+consistency+drills",
    priority: "high",
  },
  {
    type: "speed_distance_ratio",
    condition: (m: SessionMetrics) => m.avgBallSpeed / m.avgClubSpeed < 1.45,
    title: "Optimize Ball Contact",
    description: "Your ball speed relative to club speed suggests off-center hits. Better contact will add distance without swinging harder.",
    recommendation: "Work on strike quality with impact tape or foot spray. Focus on center face contact.",
    drillLink: "https://www.youtube.com/results?search_query=golf+center+strike+drills",
    priority: "medium",
  },
  {
    type: "positive_trend",
    condition: (m: SessionMetrics) => m.recentTrend === "improving" && m.sessionCount >= 10,
    title: "Great Progress!",
    description: "Your recent sessions show consistent improvement across multiple metrics. Keep up the excellent work!",
    recommendation: "Continue your current practice routine. Consider setting new goals to maintain momentum.",
    drillLink: null,
    priority: "low",
  },
  {
    type: "distance_plateau",
    condition: (m: SessionMetrics) => m.avgCarryDistance < 230 && m.recentTrend === "stable",
    title: "Break Through Distance Plateau",
    description: "Your distance has plateaued. Time to focus on specific power development.",
    recommendation: "Add resistance training and explosive movements to your routine. Work on hip rotation speed.",
    drillLink: "https://www.youtube.com/results?search_query=golf+distance+training",
    priority: "medium",
  },
  {
    type: "high_performer",
    condition: (m: SessionMetrics) => m.avgClubSpeed > 110 && m.avgConsistency > 85,
    title: "Elite Performance Level",
    description: "You're performing at an elite level with both power and consistency. Impressive!",
    recommendation: "Focus on fine-tuning launch conditions and optimizing equipment for your swing.",
    drillLink: null,
    priority: "low",
  },
  {
    type: "frequent_practice",
    condition: (m: SessionMetrics) => m.sessionCount >= 50,
    title: "Dedicated Practice Habit",
    description: "You've logged 50+ sessions! Your commitment to improvement is outstanding.",
    recommendation: "Consider periodic rest days to avoid overtraining. Quality over quantity in practice.",
    drillLink: null,
    priority: "low",
  },
  {
    type: "ball_speed_excellent",
    condition: (m: SessionMetrics) => m.avgBallSpeed > 165,
    title: "Exceptional Ball Speed",
    description: "Your ball speed is in the top tier. You're generating excellent power through the ball.",
    recommendation: "Maintain your swing fundamentals. Focus on dialing in accuracy and launch angles.",
    drillLink: null,
    priority: "low",
  },
  {
    type: "recent_decline",
    condition: (m: SessionMetrics) => m.recentTrend === "declining" && m.sessionCount >= 15,
    title: "Recent Performance Dip",
    description: "Your recent sessions show a slight decline in key metrics. This is normal but worth addressing.",
    recommendation: "Review fundamentals: grip, posture, alignment. Sometimes a lesson can help identify subtle issues.",
    drillLink: "https://www.youtube.com/results?search_query=golf+swing+fundamentals",
    priority: "high",
  },
  {
    type: "speed_consistency_tradeoff",
    condition: (m: SessionMetrics) => m.avgClubSpeed > 105 && m.avgConsistency < 70,
    title: "Speed vs. Control Balance",
    description: "You have good speed but consistency is suffering. Finding the right balance is key.",
    recommendation: "Practice at 80-85% effort to build consistent mechanics, then gradually increase speed.",
    drillLink: "https://www.youtube.com/results?search_query=golf+tempo+drills",
    priority: "medium",
  },
];

export async function generateInsightsForUser(userId: string): Promise<void> {
  try {
    const { data: sessions } = await supabase
      .from("swing_sessions")
      .select("club_speed, ball_speed, carry_distance, consistency_score, session_date")
      .eq("user_id", userId)
      .order("session_date", { ascending: false })
      .limit(20);

    if (!sessions || sessions.length < 10) {
      return;
    }

    const metrics = calculateMetrics(sessions);
    const applicableInsights = insightTemplates.filter((template) =>
      template.condition(metrics)
    );

    for (const insight of applicableInsights.slice(0, 3)) {
      const { data: existing } = await supabase
        .from("swing_insights")
        .select("id")
        .eq("user_id", userId)
        .eq("insight_type", insight.type)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .maybeSingle();

      if (!existing) {
        await supabase.from("swing_insights").insert({
          user_id: userId,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          recommendation: insight.recommendation,
          drill_link: insight.drillLink,
          priority: insight.priority,
        });
      }
    }
  } catch (error) {
    console.error("Error generating insights:", error);
  }
}

function calculateMetrics(sessions: any[]): SessionMetrics {
  const avgClubSpeed = sessions.reduce((sum, s) => sum + (s.club_speed || 0), 0) / sessions.length;
  const avgBallSpeed = sessions.reduce((sum, s) => sum + (s.ball_speed || 0), 0) / sessions.length;
  const avgCarryDistance = sessions.reduce((sum, s) => sum + (s.carry_distance || 0), 0) / sessions.length;
  const avgConsistency = sessions.reduce((sum, s) => sum + (s.consistency_score || 0), 0) / sessions.length;

  const recentSessions = sessions.slice(0, 5);
  const olderSessions = sessions.slice(5, 10);
  
  const recentAvg = recentSessions.reduce((sum, s) => sum + (s.club_speed || 0), 0) / recentSessions.length;
  const olderAvg = olderSessions.reduce((sum, s) => sum + (s.club_speed || 0), 0) / olderSessions.length;
  
  const recentTrend: "improving" | "declining" | "stable" =
    recentAvg > olderAvg * 1.03 ? "improving" :
    recentAvg < olderAvg * 0.97 ? "declining" :
    "stable";

  return {
    avgClubSpeed,
    avgBallSpeed,
    avgCarryDistance,
    avgConsistency,
    sessionCount: sessions.length,
    recentTrend,
  };
}