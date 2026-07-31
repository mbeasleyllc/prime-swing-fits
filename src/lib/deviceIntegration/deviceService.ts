import { supabase } from "@/integrations/supabase/client";
import type { DeviceConnection, SwingData, SyncLog, DeviceProvider } from "./types";

export class DeviceIntegrationService {
  /**
   * Get all device connections for a user
   */
  static async getUserConnections(userId: string): Promise<DeviceConnection[]> {
    const { data, error } = await supabase
      .from("user_device_connections")
      .select(`
        *,
        provider:device_providers(name, display_name, logo_url)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as DeviceConnection[];
  }

  /**
   * Check if user has premium access for device integration
   */
  static async checkDeviceAccess(userId: string): Promise<boolean> {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_tier")
      .eq("user_id", userId)
      .single();

    const allowedTiers = ["core", "premium", "premium_plus"];
    return profile?.subscription_tier ? allowedTiers.includes(profile.subscription_tier) : false;
  }

  /**
   * Initiate OAuth flow for device connection
   */
  static async initiateOAuth(provider: DeviceProvider): Promise<string> {
    const { data, error } = await supabase
      .from("device_providers")
      .select("oauth_authorize_url, name")
      .eq("name", provider)
      .eq("is_active", true)
      .single();

    if (error || !data) throw new Error("Provider not available");

    // Generate state token for OAuth security
    const state = crypto.randomUUID();
    sessionStorage.setItem(`oauth_state_${provider}`, state);

    const redirectUri = `${window.location.origin}/api/device/oauth/callback`;
    const authorizeUrl = new URL(data.oauth_authorize_url);
    authorizeUrl.searchParams.set("client_id", process.env.NEXT_PUBLIC_DEVICE_CLIENT_ID || "");
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("response_type", "code");

    return authorizeUrl.toString();
  }

  /**
   * Disconnect a device
   */
  static async disconnectDevice(connectionId: string): Promise<void> {
    const { error } = await supabase
      .from("user_device_connections")
      .delete()
      .eq("id", connectionId);

    if (error) throw error;
  }

  /**
   * Update connection sync settings
   */
  static async updateSyncSettings(
    connectionId: string,
    settings: { sync_frequency?: string; auto_sync_enabled?: boolean }
  ): Promise<void> {
    const { error } = await supabase
      .from("user_device_connections")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connectionId);

    if (error) throw error;
  }

  /**
   * Trigger manual sync for a specific device connection
   */
  static async syncDevice(connectionId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch("/api/device/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, syncType: "manual" }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.message || "Sync failed" };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get swing data for a user
   */
  static async getSwingData(
    userId: string,
    filters?: {
      connectionId?: string;
      startDate?: string;
      endDate?: string;
      clubType?: string;
      limit?: number;
    }
  ): Promise<{ data: SwingData[] }> {
    let query = supabase
      .from("device_swing_data")
      .select("*")
      .eq("user_id", userId)
      .order("swing_date", { ascending: false });

    if (filters?.connectionId) {
      query = query.eq("connection_id", filters.connectionId);
    }
    if (filters?.startDate) {
      query = query.gte("swing_date", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("swing_date", filters.endDate);
    }
    if (filters?.clubType) {
      query = query.eq("club_type", filters.clubType);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: (data || []) as SwingData[] };
  }

  /**
   * Get sync logs for a connection
   */
  static async getSyncLogs(connectionId: string, limit = 10): Promise<SyncLog[]> {
    const { data, error } = await supabase
      .from("device_sync_logs")
      .select("*")
      .eq("connection_id", connectionId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as SyncLog[];
  }

  /**
   * Trigger manual sync for a connection
   */
  static async triggerManualSync(connectionId: string): Promise<void> {
    const response = await fetch("/api/device/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId, syncType: "manual" }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Sync failed");
    }
  }

  /**
   * Get aggregated swing statistics
   */
  static async getSwingStatistics(userId: string, days = 30): Promise<{
    totalShots: number;
    avgBallSpeed: number;
    avgCarryDistance: number;
    avgSpinRate: number;
    avgSmashFactor: number;
    consistencyScore: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("device_swing_data")
      .select("ball_speed, carry_distance, spin_rate, smash_factor")
      .eq("user_id", userId)
      .gte("swing_date", startDate.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        totalShots: 0,
        avgBallSpeed: 0,
        avgCarryDistance: 0,
        avgSpinRate: 0,
        avgSmashFactor: 0,
        consistencyScore: 0,
      };
    }

    const validData = data.filter(d => d.ball_speed || d.carry_distance);
    const totalShots = validData.length;

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const avg = (arr: number[]) => arr.length > 0 ? sum(arr) / arr.length : 0;
    const std = (arr: number[]) => {
      if (arr.length === 0) return 0;
      const mean = avg(arr);
      const squareDiffs = arr.map(value => Math.pow(value - mean, 2));
      return Math.sqrt(avg(squareDiffs));
    };

    const ballSpeeds = validData.map(d => d.ball_speed).filter(Boolean) as number[];
    const carryDistances = validData.map(d => d.carry_distance).filter(Boolean) as number[];
    const spinRates = validData.map(d => d.spin_rate).filter(Boolean) as number[];
    const smashFactors = validData.map(d => d.smash_factor).filter(Boolean) as number[];

    // Consistency score: 100 - (avg coefficient of variation across metrics)
    const cv = (arr: number[]) => {
      const mean = avg(arr);
      return mean > 0 ? (std(arr) / mean) * 100 : 0;
    };

    const cvs = [
      ballSpeeds.length > 5 ? cv(ballSpeeds) : 0,
      carryDistances.length > 5 ? cv(carryDistances) : 0,
    ].filter(v => v > 0);

    const consistencyScore = cvs.length > 0 ? Math.max(0, 100 - avg(cvs)) : 0;

    return {
      totalShots,
      avgBallSpeed: avg(ballSpeeds),
      avgCarryDistance: avg(carryDistances),
      avgSpinRate: avg(spinRates),
      avgSmashFactor: avg(smashFactors),
      consistencyScore: Math.round(consistencyScore),
    };
  }
}