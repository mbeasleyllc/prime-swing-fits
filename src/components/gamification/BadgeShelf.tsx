import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BadgeCard } from "./BadgeCard";
import { BadgeNotification } from "./BadgeNotification";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy } from "lucide-react";

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

export function BadgeShelf({ userId }: BadgeShelfProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
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
          setBadges((prev) => [newBadge, ...prev]);
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
      setBadges(data || []);
    } catch (error) {
      console.error("Error loading badges:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
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

      {badges.length === 0 ? (
        <Alert>
          <Trophy className="h-4 w-4" />
          <AlertDescription>
            Complete swing sessions to unlock achievement badges!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badgeName={badge.badge_name}
              badgeDescription={badge.badge_description}
              badgeIcon={badge.badge_icon}
              metricValue={badge.metric_value || undefined}
              earnedDate={badge.earned_date}
            />
          ))}
        </div>
      )}
    </>
  );
}