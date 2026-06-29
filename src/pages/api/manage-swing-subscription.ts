import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action } = req.body; // 'cancel' or 'reactivate'

  try {
    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid authentication" });
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from("user_swing_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!subscription || !subscription.stripe_subscription_id) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    if (action === "cancel") {
      // Cancel at period end (don't delete immediately)
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      return res.status(200).json({
        success: true,
        message: "Subscription will cancel at period end",
      });
    } else if (action === "reactivate") {
      // Reactivate subscription
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: false,
      });

      return res.status(200).json({
        success: true,
        message: "Subscription reactivated",
      });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error: any) {
    console.error("Subscription management error:", error);
    return res.status(500).json({ error: error.message });
  }
}