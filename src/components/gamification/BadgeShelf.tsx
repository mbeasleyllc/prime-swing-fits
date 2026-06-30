import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BadgeNotification } from "./BadgeNotification";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Target, Award, Zap, TrendingUp, CheckCircle2, Star, Flame, Activity, Clock, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Badge {
  id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  badge_type: string;
  metric_value: number | null;
  earned_date: string;
}

interface BadgeShelfProps {
  userId: string;
}

// Define all 12 golf achievement badges
const PREDEFINED_BADGES = [
  {
    name: "First Fitting",
    description: "Complete your first club fitting session",
    icon: "golf-ball",
    dbKey: "first_fitting",
  },
  {
    name: "Club Expert",
    description: "Complete 10 fitting sessions",
    icon: "iron",
    dbKey: "club_expert",
  },
  {
    name: "Perfect Fit",
    description: "Achieve 100% completion on all fitting steps",
    icon: "trophy",
    dbKey: "perfect_fit",
  },
  {
    name: "Consistency King",
    description: "Maintain 90%+ accuracy across 5 sessions",
    icon: "target",
    dbKey: "consistency_king",
  },
  {
    name: "Speed Demon",
    description: "Record club speed over 115 mph",
    icon: "zap",
    dbKey: "speed_demon",
  },
  {
    name: "Distance Master",
    description: "Hit carry distance over 280 yards",
    icon: "trending",
    dbKey: "distance_master",
  },
  {
    name: "Early Bird",
    description: "Complete 5 sessions before 8 AM",
    icon: "clock",
    dbKey: "early_bird",
  },
  {
    name: "Dedicated Golfer",
    description: "Complete sessions for 30 consecutive days",
    icon: "flame",
    dbKey: "dedicated_golfer",
  },
  {
    name: "Data Enthusiast",
    description: "Import 100+ swing data points",
    icon: "activity",
    dbKey: "data_enthusiast",
  },
  {
    name: "Improvement Star",
    description: "Improve club speed by 10% over 3 months",
    icon: "star",
    dbKey: "improvement_star",
  },
  {
    name: "Achievement Hunter",
    description: "Earn 5 other badges",
    icon: "award",
    dbKey: "achievement_hunter",
  },
  {
    name: "Legend",
    description: "Earn all 11 other badges",
    icon: "champion",
    dbKey: "legend",
  },
];

export function BadgeShelf({ userId }: BadgeShelfProps) {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Badge | null>(null);

  useEffect(() => {
    loadBadges();
    
    const channel = supabase
      .channel("badge-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "achievement_badges",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBadge = payload.new as Badge;
          setEarnedBadges((prev) => [newBadge, ...prev]);
          setNotification(newBadge);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function loadBadges() {
    try {
      const { data, error } = await supabase
        .from("achievement_badges")
        .select("*")
        .eq("user_id", userId)
        .order("earned_date", { ascending: false });

      if (error) throw error;
      setEarnedBadges(data || []);
    } catch (error) {
      console.error("Error loading badges:", error);
    } finally {
      setLoading(false);
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "golf-ball":
        return <div className="w-12 h-12 rounded-full bg-white border-2 border-current" />;
      case "iron":
        return <Activity className="w-12 h-12" />;
      case "trophy":
        return <Trophy className="w-12 h-12" />;
      case "target":
        return <Target className="w-12 h-12" />;
      case "zap":
        return <Zap className="w-12 h-12" />;
      case "trending":
        return <TrendingUp className="w-12 h-12" />;
      case "clock":
        return <Clock className="w-12 h-12" />;
      case "flame":
        return <Flame className="w-12 h-12" />;
      case "activity":
        return <Activity className="w-12 h-12" />;
      case "star":
        return <Star className="w-12 h-12" />;
      case "award":
        return <Award className="w-12 h-12" />;
      case "champion":
        return <Trophy className="w-12 h-12" />;
      default:
        return <CheckCircle2 className="w-12 h-12" />;
    }
  };

  const isBadgeEarned = (badgeKey: string) => {
    return earnedBadges.some(b => 
      b.badge_name.toLowerCase().replace(/\s+/g, "_") === badgeKey ||
      b.badge_name === PREDEFINED_BADGES.find(pb => pb.dbKey === badgeKey)?.name
    );
  };

  const earnedCount = PREDEFINED_BADGES.filter(badge => isBadgeEarned(badge.dbKey)).length;
  const progressPercent = (earnedCount / PREDEFINED_BADGES.length) * 100;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <BadgeNotification
          badgeName={notification.badge_name}
          badgeDescription={notification.badge_description}
          badgeIcon={notification.badge_icon}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-gold" />
              <h3 className="text-lg font-semibold">Achievement Progress</h3>
            </div>
            <span className="text-2xl font-bold text-success">
              {earnedCount} <span className="text-base text-muted-foreground">of {PREDEFINED_BADGES.length}</span>
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {earnedCount === PREDEFINED_BADGES.length 
              ? "🎉 You've earned all badges! You're a golf legend!"
              : `Keep going! ${PREDEFINED_BADGES.length - earnedCount} more to unlock.`}
          </p>
        </div>

        {/* Badge Trophy Case */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {PREDEFINED_BADGES.map((badge, idx) => {
            const isEarned = isBadgeEarned(badge.dbKey);
            
            return (
              <div
                key={idx}
                className={`group relative transition-all duration-300 ${
                  isEarned ? "hover:scale-105" : ""
                }`}
              >
                {/* Hexagonal Card Container */}
                <div className="relative">
                  {/* Hexagonal Background */}
                  <div
                    className={`hexagon relative bg-card border-4 transition-all duration-300 ${
                      isEarned
                        ? "border-gold badge-earned"
                        : "border-border grayscale opacity-20"
                    }`}
                    style={{ 
                      aspectRatio: "1",
                      padding: "20%",
                    }}
                  >
                    {/* Shimmer Effect for Earned */}
                    {isEarned && (
                      <div className="absolute inset-0 hexagon badge-shimmer pointer-events-none" />
                    )}

                    {/* Icon Container */}
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      isEarned ? "text-gold" : "text-muted-foreground"
                    }`}>
                      {getIconComponent(badge.icon)}
                    </div>

                    {/* Lock Overlay for Locked Badges */}
                    {!isEarned && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute inset-0 hexagon bg-black/40" />
                        <Lock className="w-10 h-10 text-white relative z-10" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge Info Below Hexagon */}
                <div className="mt-4 text-center space-y-1">
                  <h4 className={`font-semibold text-sm ${
                    isEarned ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {badge.name}
                  </h4>
                  <p className={`text-xs leading-relaxed ${
                    isEarned ? "text-muted-foreground" : "text-muted-foreground/50"
                  }`}>
                    {badge.description}
                  </p>
                  
                  {/* Earned Badge Indicator */}
                  {isEarned && (
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold rounded-full text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Earned
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trophy Case Footer */}
        {earnedCount > 0 && (
          <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-xl p-6 text-center">
            <Trophy className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Your Trophy Case</h3>
            <p className="text-sm text-muted-foreground">
              You've earned {earnedCount} achievement{earnedCount !== 1 ? "s" : ""}. Keep playing to unlock more!
            </p>
          </div>
        )}
      </div>
    </>
  );
}