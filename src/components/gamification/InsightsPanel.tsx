import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, TrendingUp, Target, Zap, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Insight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  recommendation: string;
  drill_link: string | null;
  priority: string;
  created_at: string;
}

interface InsightsPanelProps {
  userId: string;
}

export function InsightsPanel({ userId }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [userId]);

  async function loadInsights() {
    try {
      const { data, error } = await supabase
        .from("swing_insights")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setLoading(false);
    }
  }

  const priorityConfig = {
    high: { color: "bg-destructive text-destructive-foreground", icon: Zap },
    medium: { color: "bg-yellow-500 text-white", icon: TrendingUp },
    low: { color: "bg-accent text-accent-foreground", icon: Target },
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-6 w-6 text-gold" />
        <h2 className="text-2xl font-bold">AI Insights</h2>
      </div>

      {insights.length === 0 ? (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            Complete at least 10 swing sessions to receive personalized insights and recommendations.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const priority = priorityConfig[insight.priority as keyof typeof priorityConfig];
            const Icon = priority?.icon || TrendingUp;

            return (
              <Card key={insight.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {insight.insight_type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  {priority && (
                    <Badge className={priority.color}>
                      {insight.priority}
                    </Badge>
                  )}
                </div>

                <p className="text-foreground mb-4">{insight.description}</p>

                <div className="rounded-lg bg-accent/10 p-4 mb-4">
                  <h4 className="font-semibold text-sm mb-2 text-accent">
                    Recommendation
                  </h4>
                  <p className="text-sm">{insight.recommendation}</p>
                </div>

                {insight.drill_link && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={insight.drill_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Practice Drill Video
                    </a>
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}