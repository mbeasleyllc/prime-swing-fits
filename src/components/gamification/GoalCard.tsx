import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { differenceInDays, format } from "date-fns";

interface GoalCardProps {
  goalName: string;
  metricName: string;
  targetValue: number;
  currentValue: number;
  startValue: number;
  progressPercent: number;
  targetDate: string;
  status: string;
  completedDate?: string | null;
}

export function GoalCard({
  goalName,
  metricName,
  targetValue,
  currentValue,
  startValue,
  progressPercent,
  targetDate,
  status,
  completedDate,
}: GoalCardProps) {
  const daysRemaining = differenceInDays(new Date(targetDate), new Date());
  const isPastDeadline = daysRemaining < 0;
  
  const dailyProgress = startValue !== targetValue
    ? (currentValue - startValue) / Math.max(1, differenceInDays(new Date(), new Date(targetDate)))
    : 0;
  
  const requiredDailyProgress = startValue !== targetValue
    ? (targetValue - currentValue) / Math.max(1, daysRemaining)
    : 0;
  
  const paceStatus = 
    status === "completed" ? "completed" :
    isPastDeadline ? "overdue" :
    dailyProgress >= requiredDailyProgress ? "on-track" :
    dailyProgress >= requiredDailyProgress * 0.7 ? "behind" :
    "critical";

  const paceConfig = {
    "completed": { label: "Completed", color: "bg-accent text-accent-foreground", icon: CheckCircle2 },
    "on-track": { label: "On Track", color: "bg-accent text-accent-foreground", icon: TrendingUp },
    "behind": { label: "Behind Pace", color: "bg-yellow-500 text-white", icon: AlertCircle },
    "critical": { label: "Critical", color: "bg-destructive text-destructive-foreground", icon: AlertCircle },
    "overdue": { label: "Overdue", color: "bg-destructive text-destructive-foreground", icon: AlertCircle },
  };

  const pace = paceConfig[paceStatus as keyof typeof paceConfig];
  const Icon = pace.icon;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{goalName}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {metricName.replace("_", " ")}
          </p>
        </div>
        <Badge className={pace.color}>
          <Icon className="h-3 w-3 mr-1" />
          {pace.label}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progressPercent.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Current</p>
            <p className="font-semibold text-lg">{currentValue.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-semibold text-lg">{targetValue.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Start</p>
            <p className="font-semibold text-lg">{startValue.toFixed(1)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {completedDate ? (
              <span className="text-muted-foreground">
                Completed {format(new Date(completedDate), "MMM d, yyyy")}
              </span>
            ) : isPastDeadline ? (
              <span className="text-destructive font-medium">
                {Math.abs(daysRemaining)} days overdue
              </span>
            ) : (
              <span className="text-muted-foreground">
                {daysRemaining} days remaining
              </span>
            )}
          </div>

          {status === "active" && !isPastDeadline && (
            <Button variant="ghost" size="sm">
              View Details
            </Button>
          )}
        </div>

        {status === "active" && !isPastDeadline && requiredDailyProgress > 0 && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="text-muted-foreground">
              Need <span className="font-semibold text-foreground">{requiredDailyProgress.toFixed(2)}</span> improvement per day to reach your goal
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}