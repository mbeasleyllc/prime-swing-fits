import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Device data sync endpoint
 * Fetches latest swing data from connected devices
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { connectionId, syncType = "manual" } = req.body;

  if (!connectionId) {
    return res.status(400).json({ error: "Connection ID required" });
  }

  try {
    // Get connection details
    const { data: connection, error: connError } = await supabaseAdmin
      .from("user_device_connections")
      .select(`
        *,
        provider:device_providers(*)
      `)
      .eq("id", connectionId)
      .single();

    if (connError || !connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Create sync log
    const syncLogId = crypto.randomUUID();
    const startedAt = new Date().toISOString();

    await supabaseAdmin.from("device_sync_logs").insert({
      id: syncLogId,
      connection_id: connectionId,
      sync_type: syncType,
      sync_status: "success",
      started_at: startedAt,
      records_imported: 0,
      records_failed: 0,
    });

    // Fetch data from device API based on provider
    let importedData: any[] = [];
    let fetchError: string | null = null;

    try {
      switch (connection.provider.name) {
        case "trackman":
          importedData = await fetchTrackmanData(connection);
          break;
        case "arccos":
          importedData = await fetchArccosData(connection);
          break;
        case "shot_scope":
          importedData = await fetchShotScopeData(connection);
          break;
        case "swing_daddy":
          importedData = await fetchSwingDaddyData(connection);
          break;
        default:
          throw new Error("Unsupported provider");
      }
    } catch (error: any) {
      fetchError = error.message;
    }

    // Import data to database
    let recordsImported = 0;
    let recordsFailed = 0;

    if (importedData.length > 0) {
      const transformedData = importedData.map(shot => ({
        connection_id: connectionId,
        user_id: connection.user_id,
        device_swing_id: shot.id,
        swing_date: shot.timestamp,
        club_type: shot.club_type,
        club_name: shot.club_name,
        swing_speed: shot.club_speed,
        ball_speed: shot.ball_speed,
        smash_factor: shot.smash_factor,
        launch_angle: shot.launch_angle,
        attack_angle: shot.attack_angle,
        club_path: shot.club_path,
        face_angle: shot.face_angle,
        spin_rate: shot.spin_rate,
        backspin: shot.backspin,
        sidespin: shot.sidespin,
        carry_distance: shot.carry_distance,
        total_distance: shot.total_distance,
        max_height: shot.max_height,
        lateral_deviation: shot.lateral_deviation,
        offline_distance: shot.offline_distance,
        shot_shape: shot.shot_shape,
        gps_latitude: shot.latitude,
        gps_longitude: shot.longitude,
        course_name: shot.course,
        hole_number: shot.hole,
        target_distance: shot.target_distance,
        raw_data: shot,
      }));

      const { error: insertError } = await supabaseAdmin
        .from("device_swing_data")
        .upsert(transformedData, {
          onConflict: "connection_id,device_swing_id",
          ignoreDuplicates: true,
        });

      if (insertError) {
        recordsFailed = transformedData.length;
      } else {
        recordsImported = transformedData.length;
      }
    }

    // Update sync log
    await supabaseAdmin
      .from("device_sync_logs")
      .update({
        sync_status: fetchError ? "failed" : "success",
        records_imported: recordsImported,
        records_failed: recordsFailed,
        completed_at: new Date().toISOString(),
        error_message: fetchError,
      })
      .eq("id", syncLogId);

    // Update connection last sync
    await supabaseAdmin
      .from("user_device_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        error_message: fetchError,
        error_count: fetchError ? connection.error_count + 1 : 0,
        connection_status: fetchError ? "error" : "active",
      })
      .eq("id", connectionId);

    return res.status(200).json({
      success: true,
      records_imported: recordsImported,
      records_failed: recordsFailed,
      error: fetchError,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return res.status(500).json({ error: error.message || "Sync failed" });
  }
}

// Device-specific data fetch functions (placeholders for actual API integration)

async function fetchTrackmanData(connection: any): Promise<any[]> {
  // TODO: Implement actual Trackman API integration
  // This requires Trackman API credentials and proper authentication
  return [];
}

async function fetchArccosData(connection: any): Promise<any[]> {
  // TODO: Implement actual Arccos API integration
  return [];
}

async function fetchShotScopeData(connection: any): Promise<any[]> {
  // TODO: Implement actual Shot Scope API integration
  return [];
}

async function fetchSwingDaddyData(connection: any): Promise<any[]> {
  // TODO: Implement actual SwingDaddy API integration
  return [];
}