import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * OAuth callback handler for device integrations
 * Exchanges authorization code for access token and stores connection
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, state, provider, error: oauthError } = req.query;

  // Handle OAuth errors
  if (oauthError) {
    return res.redirect(`/profile/settings?device_error=${oauthError}`);
  }

  if (!code || !state || !provider) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Get user session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.redirect("/auth/login?redirect=/profile/settings");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);

    if (!user) {
      return res.redirect("/auth/login?redirect=/profile/settings");
    }

    // Check tier access
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("subscription_tier")
      .eq("user_id", user.id)
      .single();

    const allowedTiers = ["core", "premium", "premium_plus"];
    if (!profile?.subscription_tier || !allowedTiers.includes(profile.subscription_tier)) {
      return res.redirect("/profile/settings?device_error=tier_required");
    }

    // Get provider details
    const { data: deviceProvider } = await supabaseAdmin
      .from("device_providers")
      .select("*")
      .eq("name", provider)
      .eq("is_active", true)
      .single();

    if (!deviceProvider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Exchange code for access token
    // NOTE: This is a placeholder - actual implementation depends on each provider's OAuth flow
    const tokenResponse = await fetch(deviceProvider.oauth_token_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.DEVICE_OAUTH_CLIENT_ID,
        client_secret: process.env.DEVICE_OAUTH_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/device/oauth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange authorization code");
    }

    const tokenData = await tokenResponse.json();

    // Store connection
    const { error: insertError } = await supabaseAdmin
      .from("user_device_connections")
      .upsert({
        user_id: user.id,
        provider_id: deviceProvider.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        connection_status: "active",
        auto_sync_enabled: true,
        sync_frequency: "hourly",
      }, {
        onConflict: "user_id,provider_id",
      });

    if (insertError) throw insertError;

    // Trigger initial sync
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/device/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        provider: provider as string,
        syncType: "automatic",
      }),
    }).catch(() => {
      // Initial sync failure is non-blocking
      console.error("Initial sync failed");
    });

    return res.redirect("/profile/settings?device_connected=true");
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.redirect("/profile/settings?device_error=connection_failed");
  }
}