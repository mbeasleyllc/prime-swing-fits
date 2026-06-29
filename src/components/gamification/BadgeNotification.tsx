import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Trophy } from "lucide-react";

interface BadgeNotificationProps {
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  onClose: () => void;
}

export function BadgeNotification({
  badgeName,
  badgeDescription,
  badgeIcon,
  onClose,
}: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Card className="w-80 p-6 border-2 border-accent shadow-2xl bg-card">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-4xl shrink-0">
            {badgeIcon}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-gold" />
                  <span className="text-xs font-semibold text-gold uppercase">
                    Badge Unlocked!
                  </span>
                </div>
                <h3 className="font-bold text-lg">{badgeName}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {badgeDescription}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}