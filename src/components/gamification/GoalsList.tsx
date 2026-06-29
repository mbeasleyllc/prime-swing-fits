import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GoalCard } from "./GoalCard";
import { GoalWizard } from "./GoalWizard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Goal {
  id: string;
  goal_name: string;
  metric_name: string;
  target_value: number;
  current_value: number;
  start_value: number;
  progress_percent: number;
  target_date: string;
  status: string;
  completed_date: string | null;
}

interface GoalsListProps {
  userId: string;
}

export function GoalsList({ userId }: GoalsListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    loadGoals();

    const channel = supabase
      .channel("goal-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "swing_goals",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function loadGoals() {
    try {
      const { data, error } = await supabase
        .from("swing_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const otherGoals = goals.filter((g) => !["active", "completed"].includes(g.status));

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <>
      <GoalWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        userId={userId}
        onGoalCreated={loadGoals}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Goals</h2>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              Set improvement goals to track your progress and stay motivated!
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedGoals.length})
              </TabsTrigger>
              <TabsTrigger value="other">
                Other ({otherGoals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              {activeGoals.length === 0 ? (
                <Alert>
                  <AlertDescription>No active goals yet.</AlertDescription>
                </Alert>
              ) : (
                activeGoals.map((goal) => (
                  <GoalCard key={goal.id} {...goal} />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {completedGoals.length === 0 ? (
                <Alert>
                  <AlertDescription>No completed goals yet.</AlertDescription>
                </Alert>
              ) : (
                completedGoals.map((goal) => (
                  <GoalCard key={goal.id} {...goal} />
                ))
              )}
            </TabsContent>

            <TabsContent value="other" className="space-y-4 mt-4">
              {otherGoals.length === 0 ? (
                <Alert>
                  <AlertDescription>No archived or abandoned goals.</AlertDescription>
                </Alert>
              ) : (
                otherGoals.map((goal) => (
                  <GoalCard key={goal.id} {...goal} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}