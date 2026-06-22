import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId, userId } = req.body;

  if (!sessionId || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [playerRes, swingRes, physicalRes, equipmentRes] = await Promise.all([
      supabase.from("player_profile").select("*").eq("session_id", sessionId).eq("user_id", userId).single(),
      supabase.from("swing_profile").select("*").eq("session_id", sessionId).eq("user_id", userId).single(),
      supabase.from("physical_profile").select("*").eq("session_id", sessionId).eq("user_id", userId).single(),
      supabase.from("current_equipment").select("*").eq("session_id", sessionId).eq("user_id", userId).single(),
    ]);

    if (playerRes.error || swingRes.error || physicalRes.error || equipmentRes.error) {
      throw new Error("Failed to fetch session data");
    }

    const player = playerRes.data;
    const swing = swingRes.data;
    const physical = physicalRes.data;
    const equipment = equipmentRes.data;

    let clubLengthAdj = "standard";
    const wristToFloor = physical.wrist_to_floor;
    if (wristToFloor <= 29.0) {
      clubLengthAdj = "-1 inch";
    } else if (wristToFloor >= 29.1 && wristToFloor <= 32.0) {
      clubLengthAdj = "-0.5 inch";
    } else if (wristToFloor >= 32.1 && wristToFloor <= 35.0) {
      clubLengthAdj = "standard";
    } else if (wristToFloor >= 35.1 && wristToFloor <= 38.0) {
      clubLengthAdj = "+0.5 inch";
    } else if (wristToFloor >= 38.1) {
      clubLengthAdj = "+1 inch";
    }

    let lieAngleAdj = "standard";
    const totalHeightInches = physical.height_ft * 12 + physical.height_in;
    if (totalHeightInches < 64) {
      lieAngleAdj = "2° flat";
    } else if (totalHeightInches >= 64 && totalHeightInches <= 67) {
      lieAngleAdj = "1° flat";
    } else if (totalHeightInches >= 68 && totalHeightInches <= 72) {
      lieAngleAdj = "standard";
    } else if (totalHeightInches >= 73 && totalHeightInches <= 75) {
      lieAngleAdj = "1° upright";
    } else if (totalHeightInches > 75) {
      lieAngleAdj = "2° upright";
    }

    let gripSizeRec = "standard";
    const handSizeMap: Record<string, string> = {
      small: "undersize",
      medium: "standard",
      large: "midsize",
      extra_large: "oversize",
    };
    gripSizeRec = handSizeMap[physical.hand_size] || "standard";

    let score = 0;
    if (swing.swing_tempo === "fast") score += 2;
    else if (swing.swing_tempo === "moderate") score += 1;

    if (swing.swing_strength === "strong") score += 2;
    else if (swing.swing_strength === "moderate") score += 1;

    if (swing.ball_flight === "low") score += 1;

    let shaftFlexRec = "R";
    if (score <= 1) {
      shaftFlexRec = "L";
    } else if (score === 2) {
      shaftFlexRec = "A";
    } else if (score === 3) {
      shaftFlexRec = "R";
    } else if (score === 4) {
      shaftFlexRec = "S";
    } else if (score >= 5) {
      shaftFlexRec = "X";
    }

    let shaftWeight = "mid (70-90g)";
    if (swing.swing_strength === "light" || player.experience === "beginner") {
      shaftWeight = "lightweight (<70g)";
    } else if (swing.swing_strength === "moderate" && player.experience !== "beginner") {
      shaftWeight = "mid (70-90g)";
    } else if (swing.swing_strength === "strong") {
      shaftWeight = "heavy (90g+)";
    }

    let clubTypeRec = "hybrid/game improvement";
    if (player.experience === "beginner" || player.handicap === "26+") {
      clubTypeRec = "game improvement";
    } else if (
      player.experience === "intermediate" ||
      player.handicap === "6-15" ||
      player.handicap === "16-25"
    ) {
      clubTypeRec = "hybrid/game improvement";
    } else if (
      player.experience === "advanced" &&
      (player.handicap === "none" || player.handicap === "0-5")
    ) {
      clubTypeRec = "player irons";
    }

    const advisoryNotes: string[] = [];

    if (physical.mobility_limit === "severe" || physical.mobility_limit === "moderate") {
      advisoryNotes.push(
        "Due to your physical limitations, consider lightweight graphite shafts for reduced strain. A professional fitting is strongly recommended."
      );
    }

    if (equipment.satisfaction <= 2) {
      advisoryNotes.push(
        "Your low satisfaction with current equipment suggests significant fit issues. A full set re-fitting may be beneficial."
      );
    }

    if (swing.typical_shot === "slice" || swing.typical_shot === "hook") {
      advisoryNotes.push(
        "Your shot pattern indicates potential swing path issues that equipment changes alone may not fully correct. Consider a swing lesson alongside your fitting."
      );
    }

    if (player.primary_goal === "distance" && (shaftFlexRec === "L" || shaftFlexRec === "A")) {
      advisoryNotes.push(
        "For maximum distance gains with your swing profile, focus on properly fitted lightweight shafts rather than stiffer flex options."
      );
    }

    const { error: recError } = await supabase.from("fitting_recommendations").upsert(
      {
        session_id: sessionId,
        user_id: userId,
        club_length_adj: clubLengthAdj,
        lie_angle_adj: lieAngleAdj,
        grip_size_rec: gripSizeRec,
        shaft_flex_rec: shaftFlexRec,
        shaft_weight: shaftWeight,
        club_type_rec: clubTypeRec,
        advisory_notes: advisoryNotes.join("\n\n"),
      },
      {
        onConflict: "session_id",
      }
    );

    if (recError) {
      throw recError;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
}