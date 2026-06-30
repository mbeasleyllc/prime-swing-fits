import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { sendFittingReportEmail } from "@/lib/emailService";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID required" });
  }

  try {
    const [profileRes, swingRes, physicalRes, equipmentRes, swingDataRes] = await Promise.all([
      supabase.from("player_profile").select("*").eq("session_id", sessionId).single(),
      supabase.from("swing_profile").select("*").eq("session_id", sessionId).single(),
      supabase.from("physical_profile").select("*").eq("session_id", sessionId).single(),
      supabase.from("current_equipment").select("*").eq("session_id", sessionId).single(),
      supabase.from("swing_sessions").select("*, swing_dna(*)").eq("user_id", (await supabase.from("player_profile").select("user_id").eq("session_id", sessionId).single()).data?.user_id || "").order("session_date", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const profile = profileRes.data;
    const swing = swingRes.data;
    const physical = physicalRes.data;
    const equipment = equipmentRes.data;
    const latestSwingData = swingDataRes.data;

    if (!profile || !swing || !physical) {
      return res.status(400).json({ error: "Incomplete fitting data" });
    }

    let clubLengthAdj = "standard";
    const wtf = physical.wrist_to_floor || 0;
    if (wtf <= 29.0) clubLengthAdj = "-1 inch";
    else if (wtf <= 32.0) clubLengthAdj = "-0.5 inch";
    else if (wtf <= 35.0) clubLengthAdj = "standard";
    else if (wtf <= 38.0) clubLengthAdj = "+0.5 inch";
    else clubLengthAdj = "+1 inch";

    let lieAngleAdj = "standard";
    const totalHeight = (physical.height_ft || 0) * 12 + (physical.height_in || 0);
    if (totalHeight < 64) lieAngleAdj = "2° flat";
    else if (totalHeight <= 67) lieAngleAdj = "1° flat";
    else if (totalHeight <= 72) lieAngleAdj = "standard";
    else if (totalHeight <= 75) lieAngleAdj = "1° upright";
    else lieAngleAdj = "2° upright";

    const gripSizeMap: Record<string, string> = {
      small: "undersize",
      medium: "standard",
      large: "midsize",
      extra_large: "oversize",
    };
    const gripSizeRec = gripSizeMap[physical.hand_size || "medium"] || "standard";

    let flexScore = 0;
    
    // Use actual swing data if available
    let usedSwingData = false;
    if (latestSwingData && latestSwingData.club_speed_mph) {
      usedSwingData = true;
      
      // Use actual club speed for flex determination
      if (latestSwingData.club_speed_mph >= 105) flexScore += 3;
      else if (latestSwingData.club_speed_mph >= 95) flexScore += 2;
      else if (latestSwingData.club_speed_mph >= 85) flexScore += 1;
      
      // Factor in consistency score
      if (latestSwingData.consistency_score && latestSwingData.consistency_score >= 80) flexScore += 1;
      else if (latestSwingData.consistency_score && latestSwingData.consistency_score < 60) flexScore -= 1;
      
      // Use launch angle for recommendations
      if (latestSwingData.launch_angle_deg && latestSwingData.launch_angle_deg < 10) {
        flexScore += 1; // Stiffer flex for low launch
      }
    } else {
      // Fall back to estimated values
      if (swing.swing_tempo === "fast") flexScore += 2;
      else if (swing.swing_tempo === "moderate") flexScore += 1;
      if (swing.swing_strength === "strong") flexScore += 2;
      else if (swing.swing_strength === "moderate") flexScore += 1;
      if (swing.ball_flight === "low") flexScore += 1;
    }

    let shaftFlexRec = "R";
    if (flexScore <= 1) shaftFlexRec = "L";
    else if (flexScore === 2) shaftFlexRec = "A";
    else if (flexScore === 3) shaftFlexRec = "R";
    else if (flexScore === 4) shaftFlexRec = "S";
    else shaftFlexRec = "X";

    let shaftWeight = "mid (70-90g)";
    if (swing.swing_strength === "light" || profile.experience === "beginner") {
      shaftWeight = "lightweight (<70g)";
    } else if (swing.swing_strength === "strong") {
      shaftWeight = "heavy (90g+)";
    }

    // Golf Ball Recommendation
    let golfBallRec = "Titleist Pro V1";
    let ballCompression = 90;
    let ballSpinRating = "High";
    let ballOptimalSwingSpeed = "95-105 mph";

    if (usedSwingData && latestSwingData?.club_speed_mph) {
      const clubSpeed = latestSwingData.club_speed_mph;
      
      if (clubSpeed >= 105) {
        golfBallRec = "Titleist Pro V1x";
        ballCompression = 100;
        ballSpinRating = "High";
        ballOptimalSwingSpeed = "105+ mph";
      } else if (clubSpeed >= 95) {
        golfBallRec = "Titleist Pro V1";
        ballCompression = 90;
        ballSpinRating = "High";
        ballOptimalSwingSpeed = "95-105 mph";
      } else if (clubSpeed >= 85) {
        golfBallRec = "TaylorMade TP5";
        ballCompression = 85;
        ballSpinRating = "Mid-High";
        ballOptimalSwingSpeed = "85-95 mph";
      } else if (clubSpeed >= 75) {
        golfBallRec = "Callaway Chrome Soft";
        ballCompression = 75;
        ballSpinRating = "Mid";
        ballOptimalSwingSpeed = "75-85 mph";
      } else {
        golfBallRec = "Srixon Soft Feel";
        ballCompression = 60;
        ballSpinRating = "Low";
        ballOptimalSwingSpeed = "60-75 mph";
      }
    } else {
      // Fallback based on swing profile
      if (swing.swing_strength === "strong" && swing.swing_tempo === "fast") {
        golfBallRec = "Titleist Pro V1x";
        ballCompression = 100;
        ballSpinRating = "High";
        ballOptimalSwingSpeed = "105+ mph";
      } else if (swing.swing_strength === "moderate" || swing.swing_tempo === "moderate") {
        golfBallRec = "TaylorMade TP5";
        ballCompression = 85;
        ballSpinRating = "Mid-High";
        ballOptimalSwingSpeed = "85-95 mph";
      } else {
        golfBallRec = "Callaway Chrome Soft";
        ballCompression = 75;
        ballSpinRating = "Mid";
        ballOptimalSwingSpeed = "75-85 mph";
      }
    }

    // Adjust ball for player goals
    if (profile.primary_goal === "distance") {
      if (ballCompression < 85) {
        golfBallRec = "Callaway Supersoft";
        ballCompression = 38;
        ballSpinRating = "Low";
      }
    } else if (profile.primary_goal === "control") {
      if (ballCompression > 85) {
        ballSpinRating = "High";
      }
    }

    let clubTypeRec = "game improvement";
    if (profile.experience === "beginner" || profile.handicap === "26+") {
      clubTypeRec = "game improvement";
    } else if (profile.experience === "intermediate" || ["6-15", "16-25"].includes(profile.handicap)) {
      clubTypeRec = "hybrid/game improvement";
    } else if (profile.experience === "advanced" && ["none", "0-5"].includes(profile.handicap)) {
      clubTypeRec = "player irons";
    }

    let advisoryNotes = "";
    if (usedSwingData) {
      advisoryNotes += "These recommendations incorporate your actual swing data from recent practice sessions. ";
    }
    if (["severe", "moderate"].includes(physical.mobility_limit || "")) {
      advisoryNotes += "Due to your physical limitations, consider lightweight graphite shafts for reduced strain. A professional fitting is strongly recommended. ";
    }
    if ((equipment?.satisfaction || 5) <= 2) {
      advisoryNotes += "Your low satisfaction with current equipment suggests significant fit issues. A full set re-fitting may be beneficial. ";
    }
    if (["slice", "hook"].includes(swing.typical_shot || "")) {
      advisoryNotes += "Your shot pattern indicates potential swing path issues that equipment changes alone may not fully correct. Consider a swing lesson alongside your fitting. ";
    }
    if (profile.primary_goal === "distance" && ["L", "A"].includes(shaftFlexRec)) {
      advisoryNotes += "For maximum distance gains with your swing profile, focus on properly fitted lightweight shafts rather than stiffer flex options. ";
    }

    const predictedDriverGain = profile.experience === "beginner" ? "15-25 yards" : profile.experience === "intermediate" ? "10-15 yards" : "5-10 yards";
    const predictedAccuracy = swing.typical_shot === "straight" ? "5-10% improvement" : "10-20% improvement";
    const predictedConsistency = profile.experience === "beginner" ? "Moderate improvement" : "Significant improvement";

    const gapsIdentified: string[] = [];
    const redundancies: string[] = [];
    if (profile.handicap === "26+" || profile.experience === "beginner") {
      gapsIdentified.push("Consider adding a hybrid to replace long irons");
      redundancies.push("Multiple wedges may be redundant - focus on 2-3 key lofts");
    }
    if (swing.ball_flight === "low") {
      gapsIdentified.push("Add high-lofted fairway wood for approach shots");
    }

    const recommendedBag = profile.experience === "beginner"
      ? "Driver, 3-wood, 5-hybrid, 6-PW irons, SW, Putter (11 clubs)"
      : profile.experience === "intermediate"
      ? "Driver, 3-wood, 5-wood/3-hybrid, 4-PW irons, 52°/56°/60° wedges, Putter (14 clubs)"
      : "Driver, 3-wood, 2-iron/driving iron, 4-PW irons, 50°/54°/58° wedges, Putter (14 clubs)";

    const driverConfidence = profile.experience === "advanced" && swing.swing_strength === "strong" ? 95 : profile.experience === "intermediate" ? 85 : 75;
    const ironsConfidence = clubTypeRec === "player irons" ? 92 : clubTypeRec === "hybrid/game improvement" ? 88 : 80;
    const wedgeConfidence = profile.experience === "advanced" ? 90 : 82;
    const putterConfidence = 85;

    const driverSpec = `Length: ${clubLengthAdj} | Loft: ${swing.ball_flight === "low" ? "10.5-12°" : "9-10.5°"} | Shaft: ${shaftFlexRec} flex, ${shaftWeight}`;
    const fairwayWoods = profile.experience === "beginner" ? "3-wood (15-16°), consider skipping 5-wood" : "3-wood (15°), 5-wood (18°) or 7-wood (21°)";
    const hybrids = profile.experience === "beginner" || profile.handicap === "26+" ? "5-hybrid (25°) strongly recommended" : profile.experience === "intermediate" ? "3-hybrid (19°) or 4-hybrid (22°)" : "Optional: 2-iron replacement hybrid";
    const ironsSpec = `Type: ${clubTypeRec} | Set: ${profile.experience === "beginner" ? "6-PW (5 clubs)" : "4-PW (7 clubs)"} | Shaft: ${shaftFlexRec} flex, ${shaftWeight}, ${clubLengthAdj}`;
    const wedgesSpec = profile.experience === "beginner" ? "SW (56°) included in set" : profile.experience === "intermediate" ? "52° gap wedge, 56° sand wedge, 60° lob wedge" : "50°, 54°, 58° wedges (adjustable grinds)";
    const putterSpec = `Length: ${clubLengthAdj} | Style: ${profile.experience === "beginner" ? "Mallet (high MOI)" : "Blade or mallet based on preference"}`;

    const { data: recommendation, error: recError } = await supabase
      .from("fitting_recommendations")
      .insert({
        session_id: sessionId,
        user_id: profile.user_id,
        club_length_adj: clubLengthAdj,
        lie_angle_adj: lieAngleAdj,
        grip_size_rec: gripSizeRec,
        shaft_flex_rec: shaftFlexRec,
        shaft_weight: shaftWeight,
        club_type_rec: clubTypeRec,
        advisory_notes: advisoryNotes.trim(),
        predicted_driver_gain: predictedDriverGain,
        predicted_accuracy: predictedAccuracy,
        predicted_consistency: predictedConsistency,
        gaps_identified: gapsIdentified,
        redundancies: redundancies,
        recommended_bag: recommendedBag,
        driver_confidence: driverConfidence,
        irons_confidence: ironsConfidence,
        wedge_confidence: wedgeConfidence,
        putter_confidence: putterConfidence,
        driver_spec: driverSpec,
        fairway_woods: fairwayWoods,
        hybrids: hybrids,
        irons_spec: ironsSpec,
        wedges_spec: wedgesSpec,
        putter_spec: putterSpec,
        golf_ball_rec: golfBallRec,
        ball_compression: ballCompression,
        ball_spin_rating: ballSpinRating,
        ball_optimal_swing_speed: ballOptimalSwingSpeed,
      })
      .select()
      .single();

    if (recError) {
      console.error("Failed to insert recommendation:", recError);
      return res.status(500).json({ error: "Failed to create recommendation" });
    }

    // Send email notification with fitting report
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("id", profile.user_id)
        .single();

      if (userData && userData.email) {
        await sendFittingReportEmail({
          to: userData.email,
          userName: userData.full_name || "Golfer",
          sessionId: sessionId,
          recommendations: {
            clubLengthAdj,
            lieAngleAdj,
            gripSizeRec,
            shaftFlexRec,
            shaftWeight,
            clubTypeRec,
            advisoryNotes: advisoryNotes.trim(),
          },
        });
        console.log(`Fitting report email sent to ${userData.email}`);
      }
    } catch (emailError) {
      // Don't fail the request if email fails - log and continue
      console.error("Failed to send email notification:", emailError);
    }

    return res.status(200).json({ recommendation, usedSwingData });
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
}