import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeLevel?: "bronze" | "silver" | "gold" | "platinum";
  metricValue?: number;
  earnedDate?: string;
  isLocked?: boolean;
  progress?: number;
}

export function BadgeCard({
  badgeName,
  badgeDescription,
  badgeIcon,
  badgeLevel,
  metricValue,
  earnedDate,
  isLocked = false,
  progress = 0,
}: BadgeCardProps) {
  const levelColors = {
    bronze: "bg-amber-600",
    silver: "bg-slate-400",
    gold: "bg-yellow-500",
    platinum: "bg-cyan-400",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-6 transition-all hover:shadow-lg",
        isLocked ? "opacity-50 grayscale" : ""
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "relative flex h-20 w-20 items-center justify-center rounded-full text-4xl",
          badgeLevel && levelColors[badgeLevel],
          !badgeLevel && "bg-muted"
        )}>
          {isLocked ? "🔒" : badgeIcon}
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-lg">{badgeName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {badgeDescription}
          </p>
          
          {metricValue && !isLocked && (
            <Badge variant="secondary" className="mt-2">
              {metricValue.toFixed(1)}
            </Badge>
          )}

          {earnedDate && !isLocked && (
            <p className="text-xs text-muted-foreground mt-2">
              Earned {new Date(earnedDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {isLocked && progress > 0 && (
          <div className="w-full">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center mt-1">
              {progress.toFixed(0)}% complete
            </p>
          </div>
        )}
      </div>

      {badgeLevel && !isLocked && (
        <div className={cn(
          "absolute top-2 right-2 h-3 w-3 rounded-full",
          levelColors[badgeLevel]
        )} />
      )}
    </Card>
  );
}