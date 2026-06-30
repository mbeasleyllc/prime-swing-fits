import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get session from request headers
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }

    const { userId, updates } = req.body;

    if (!userId || !updates) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update user role in profiles table if provided
    if (updates.role !== undefined) {
      const { error: roleError } = await supabase
        .from("profiles")
        .update({ role: updates.role, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (roleError) throw roleError;
    }

    // Update club fitting tier in user_profiles if provided
    if (updates.subscription_tier !== undefined) {
      const { error: tierError } = await supabase
        .from("user_profiles")
        .upsert({
          id: userId,
          subscription_tier: updates.subscription_tier,
          updated_at: new Date().toISOString(),
        });

      if (tierError) throw tierError;
    }

    // Update Swing Analytics subscription if provided
    if (updates.swing_analytics !== undefined) {
      if (updates.swing_analytics) {
        // Enable Swing Analytics - create or update subscription
        const { error: swingError } = await supabase
          .from("user_swing_subscriptions")
          .upsert({
            user_id: userId,
            status: "active",
            plan_id: "price_swing_analytics_monthly",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          });

        if (swingError) throw swingError;
      } else {
        // Disable Swing Analytics
        const { error: swingError } = await supabase
          .from("user_swing_subscriptions")
          .update({
            status: "canceled",
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (swingError) throw swingError;
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}