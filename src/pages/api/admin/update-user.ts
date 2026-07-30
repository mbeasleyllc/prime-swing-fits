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

    const { userId, updates, action, profileData, newPassword, sendPasswordReset } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Handle password management
    if (action === "set_password" && newPassword) {
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (passwordError) throw passwordError;

      return res.status(200).json({ success: true, message: "Password updated successfully" });
    }

    if (action === "send_password_reset" || sendPasswordReset) {
      // Get user's email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (userError || !userData.user.email) {
        throw new Error("Could not retrieve user email");
      }

      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
        userData.user.email,
        { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password` }
      );

      if (resetError) throw resetError;

      return res.status(200).json({ success: true, message: "Password reset email sent" });
    }

    // Handle full profile updates
    if (profileData) {
      // Handle email update separately through Supabase Auth
      if (profileData.email) {
        const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { email: profileData.email }
        );

        if (emailError) throw emailError;

        // Also update email in profiles table
        const { error: profileEmailError } = await supabaseAdmin
          .from("profiles")
          .update({ email: profileData.email, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (profileEmailError) throw profileEmailError;
      }

      // Remove email from profileData before updating user_profiles
      const { email, ...userProfileData } = profileData;

      const { data: existingProfile } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const profileUpdates = {
        ...userProfileData,
        updated_at: new Date().toISOString(),
      };

      if (existingProfile) {
        const { error: updateError } = await supabaseAdmin
          .from("user_profiles")
          .update(profileUpdates)
          .eq("user_id", userId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabaseAdmin
          .from("user_profiles")
          .insert({
            user_id: userId,
            ...profileUpdates,
            created_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      return res.status(200).json({ success: true, message: "Profile updated successfully" });
    }

    // Handle special actions
    if (action === "archive") {
      const { error: archiveError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: "876000h" }
      );

      if (archiveError) throw archiveError;

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
      const { error: unarchiveError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: "none" }
      );

      if (unarchiveError) throw unarchiveError;

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
      const { data: existingProfile } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingProfile) {
        const { error: tierError } = await supabaseAdmin
          .from("user_profiles")
          .update({
            subscription_tier: updates.subscription_tier,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (tierError) throw tierError;
      } else {
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