import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

    // Verify admin role using regular client
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }

    const { userId, updates, action } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Handle special actions
    if (action === "archive") {
      // Disable the user's auth account
      const { error: archiveError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: "876000h" } // 100 years = effectively permanent
      );

      if (archiveError) throw archiveError;

      // Mark as archived in profiles
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ 
          archived: true,
          updated_at: new Date().toISOString() 
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      return res.status(200).json({ success: true, message: "User archived successfully" });
    }

    if (action === "unarchive") {
      // Re-enable the user's auth account
      const { error: unarchiveError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: "none" }
      );

      if (unarchiveError) throw unarchiveError;

      // Unmark archived in profiles
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ 
          archived: false,
          updated_at: new Date().toISOString() 
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      return res.status(200).json({ success: true, message: "User restored successfully" });
    }

    if (action === "cancel_subscriptions") {
      // Cancel Club Fitting tier
      const { data: existingProfile } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingProfile) {
        const { error: tierError } = await supabaseAdmin
          .from("user_profiles")
          .update({
            subscription_tier: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (tierError) throw tierError;
      }

      // Cancel Swing Analytics subscription
      const { error: swingError } = await supabaseAdmin
        .from("user_swing_subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (swingError && swingError.code !== "PGRST116") throw swingError;

      return res.status(200).json({ success: true, message: "All subscriptions canceled" });
    }

    // Handle regular updates if no special action
    if (!updates) {
      return res.status(400).json({ error: "Missing updates" });
    }

    // Use admin client for all database operations (bypasses RLS)
    
    // Update user role in profiles table if provided
    if (updates.role !== undefined) {
      const { error: roleError } = await supabaseAdmin
        .from("profiles")
        .update({ role: updates.role, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (roleError) throw roleError;
    }

    // Update club fitting tier in user_profiles if provided
    if (updates.subscription_tier !== undefined) {
      // First check if profile exists
      const { data: existingProfile } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: tierError } = await supabaseAdmin
          .from("user_profiles")
          .update({
            subscription_tier: updates.subscription_tier,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (tierError) throw tierError;
      } else {
        // Insert new profile
        const { error: tierError } = await supabaseAdmin
          .from("user_profiles")
          .insert({
            user_id: userId,
            subscription_tier: updates.subscription_tier,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (tierError) throw tierError;
      }
    }

    // Update Swing Analytics subscription if provided
    if (updates.swing_analytics !== undefined) {
      if (updates.swing_analytics) {
        // Enable Swing Analytics - create or update subscription
        const { error: swingError } = await supabaseAdmin
          .from("user_swing_subscriptions")
          .upsert({
            user_id: userId,
            status: "active",
            plan_id: "price_swing_analytics_monthly",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (swingError) throw swingError;
      } else {
        // Disable Swing Analytics
        const { error: swingError } = await supabaseAdmin
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