import { supabase } from "@/integrations/supabase/client";

export interface SwingSubscriptionAccess {
  hasAccess: boolean;
  tier: "none" | "core_addon" | "premium" | "premium_plus";
  dataRetentionMonths: number | null;
  requiresUpgrade: boolean;
  blockReason?: string;
}

/**
 * Check if user has access to Swing Analytics features
 */
export async function checkSwingAnalyticsAccess(
  userId: string
): Promise<SwingSubscriptionAccess> {
  // Get user's main subscription tier
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    return {
      hasAccess: false,
      tier: "none",
      dataRetentionMonths: null,
      requiresUpgrade: true,
      blockReason: "Unable to verify user subscription",
    };
  }

  // Entry tier users are blocked - must upgrade
  if (user.subscription_tier === "entry") {
    return {
      hasAccess: false,
      tier: "none",
      dataRetentionMonths: null,
      requiresUpgrade: true,
      blockReason: "Swing Analytics is not included in Entry tier",
    };
  }

  // Check for active swing analytics subscription
  const { data: swingSubscription } = await supabase
    .from("user_swing_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  // Core tier users need add-on subscription
  if (user.subscription_tier === "core") {
    if (!swingSubscription || swingSubscription.tier === "none") {
      return {
        hasAccess: false,
        tier: "none",
        dataRetentionMonths: null,
        requiresUpgrade: true,
        blockReason: "Add Swing Analytics for $12.99/month",
      };
    }

    return {
      hasAccess: true,
      tier: (swingSubscription.tier as "core_addon" | "premium" | "premium_plus"),
      dataRetentionMonths: swingSubscription.data_retention_months,
      requiresUpgrade: false,
    };
  }

  // Premium tier - included, 12-month retention
  if (user.subscription_tier === "premium") {
    return {
      hasAccess: true,
      tier: "premium",
      dataRetentionMonths: 12,
      requiresUpgrade: false,
    };
  }

  // Default fallback
  return {
    hasAccess: false,
    tier: "none",
    dataRetentionMonths: null,
    requiresUpgrade: true,
    blockReason: "Please upgrade to access Swing Analytics",
  };
}

/**
 * Check if user can import CSV data
 */
export async function checkCSVImportAccess(userId: string): Promise<boolean> {
  const access = await checkSwingAnalyticsAccess(userId);
  return access.hasAccess;
}

/**
 * Get data retention limit for user
 */
export async function getDataRetentionMonths(
  userId: string
): Promise<number | null> {
  const access = await checkSwingAnalyticsAccess(userId);
  return access.dataRetentionMonths;
}