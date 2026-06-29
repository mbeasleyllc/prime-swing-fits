import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Lock } from "lucide-react";
import { useRouter } from "next/router";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: "entry" | "core" | "premium";
  blockReason?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  blockReason,
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async (option: "addon" | "premium") => {
    setIsLoading(true);

    if (option === "addon") {
      // Create Stripe Checkout session for add-on
      try {
        const response = await fetch("/api/create-swing-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } catch (error) {
        console.error("Checkout error:", error);
        setIsLoading(false);
      }
    } else {
      // Redirect to main pricing page for Premium upgrade
      router.push("/pricing?highlight=premium");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-6 w-6 text-gold" />
            <DialogTitle className="text-2xl">
              Unlock Swing Analytics
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {blockReason ||
              "Track your swing data, monitor progress, and achieve your golf goals"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Core Add-on Option */}
          {currentTier === "core" && (
            <div className="border-2 border-accent rounded-lg p-6 relative">
              <Badge className="absolute -top-3 left-4 bg-accent text-white">
                Recommended
              </Badge>

              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">
                  Swing Analytics Add-on
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-accent">
                    $12.99
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Badge variant="outline" className="mt-2">
                  7-Day Free Trial
                </Badge>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>Unlimited swing data tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>3-month data retention</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>CSV import from launch monitors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>Progress charts & Swing DNA radar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>Goal tracking & achievement badges</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>AI-powered insights</span>
                </li>
              </ul>

              <Button
                className="w-full bg-accent hover:bg-accent/90"
                size="lg"
                onClick={() => handleUpgrade("addon")}
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start Free Trial
              </Button>
            </div>
          )}

          {/* Premium Tier Option */}
          <div className="border-2 border-gold rounded-lg p-6 relative bg-gradient-to-br from-gold/5 to-transparent">
            <Badge className="absolute -top-3 left-4 bg-gold text-black">
              Best Value
            </Badge>

            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">Upgrade to Premium</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gold">$99</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              {currentTier === "core" && (
                <p className="text-sm text-muted-foreground mt-2">
                  Save $56/year vs add-on
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span className="font-semibold">
                  Everything in Core + Add-on
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span>12-month data retention</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span>Priority email support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span>Advanced bag optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span>Detailed PDF reports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span>Full club comparison tools</span>
              </li>
            </ul>

            <Button
              variant="outline"
              className="w-full border-gold text-gold hover:bg-gold hover:text-black"
              size="lg"
              onClick={() => handleUpgrade("premium")}
              disabled={isLoading}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Premium Plans
            </Button>
          </div>

          {/* Entry Tier - Show Premium Only */}
          {currentTier === "entry" && (
            <div className="md:col-span-2 border-2 border-muted rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Swing Analytics requires Core tier or higher. Upgrade to Core
                ($59/year) first, then add Swing Analytics.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/pricing")}
                disabled={isLoading}
              >
                View All Plans
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Cancel anytime • No hidden fees • Secure payment via Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}