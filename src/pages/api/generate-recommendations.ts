import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/integrations/supabase/client";

interface PlayerProfile {
  height?: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// TYPES
// ============================================================================

interface FittingSessionData {
  id: string;
  user_id: string;
  selected_categories?: string[];
  
  // Player Profile
  player_name?: string;
  player_age?: number;
  handedness?: string;
  height_ft?: number;
  height_in?: number;
  height_cm?: number;
  wrist_to_floor?: number;
  glove_size?: string;
  has_physical_limitations?: boolean;
  physical_limitations_text?: string;
  
  // Golf Experience
  experience_level?: string;
  handicap_index?: number;
  handicap_goal?: number;
  average_score?: number;
  years_playing?: string;
  playing_frequency?: string;
  practice_frequency?: string;
  ball_striking_quality?: string;
  has_clubs?: boolean;
  clubs_age?: string;
  replacement_scope?: string;
  
  // Driver specific
  current_driver_loft?: number;
  current_driver_flex?: string;
  current_driver_length?: number;
  current_driver_make?: string;
  current_driver_model?: string;
  driver_distance_satisfaction?: string;
  driver_accuracy_satisfaction?: string;
  driver_ball_flight?: string;
  driver_trajectory?: string;
  driver_miss_pattern?: string[];
  driver_swing_speed?: string;
  driver_tempo?: string;
  driver_performance_goals?: string[];
  driver_head_size_pref?: string;
  driver_sound_pref?: string;
  driver_adjustability_importance?: string;
  
  // Fairway Woods specific
  current_fairway_woods?: string[];
  fairway_woods_usage?: string[];
  fairway_distance_satisfaction?: string;
  fairway_accuracy_satisfaction?: string;
  fairway_3wood_distance?: number;
  fairway_5wood_distance?: number;
  fairway_yardage_gap_issue?: boolean;
  fairway_shot_shape?: string;
  fairway_trajectory?: string;
  fairway_airborne_difficulty?: string;
  fairway_head_size_pref?: string;
  fairway_shaft_feel_pref?: string;
  fairway_goals?: string[];
  
  // Hybrids specific
  current_hybrids?: string[];
  replacing_long_irons?: boolean;
  hybrid_distance_gaps?: string;
  hybrid_primary_usage?: string[];
  hybrid_distance_satisfaction?: string;
  hybrid_accuracy_satisfaction?: string;
  hybrid_ball_flight?: string;
  hybrid_trajectory?: string;
  hybrid_vs_fairway_pref?: string;
  hybrid_launch_difficulty?: string;
  hybrid_head_style_pref?: string;
  hybrid_goals?: string[];
  
  // Irons specific
  current_irons?: string;
  current_iron_specs?: {
    make?: string;
    model?: string;
    shaft_type?: string;
    shaft_flex?: string;
  };
  irons_custom_fitted?: boolean;
  irons_ball_flight?: string;
  irons_miss_pattern?: string;
  irons_shot_shape?: string;
  irons_swing_characteristics?: string[];
  irons_7iron_distance?: number;
  irons_goals?: string[];
  
  // Wedges specific
  current_wedges?: Array<{ loft: number; type: string }>;
  wedges_loft_gaps_consistent?: string;
  wedges_spin_performance?: string;
  wedges_greenside_feel?: string;
  wedges_bunker_performance?: string;
  wedges_shot_types_used?: string[];
  wedges_distance_control?: string;
  wedges_grind_pref?: string;
  wedges_shot_versatility_importance?: string;
  wedges_goals?: string[];
  
  // Putter specific
  current_putter_length?: number;
  current_putter_weight?: number;
  current_putter_make?: string;
  current_putter_model?: string;
  putter_eye_position?: string;
  putter_posture?: string;
  putter_stroke_pattern?: string;
  putter_head_style_pref?: string;
  putter_alignment_aids_pref?: string;
  putter_grip_size_pref?: string;
  putter_stroke_type?: string;
  putter_common_miss?: string;
  putter_forgiveness_priority?: string;
  putter_goals?: string[];
  
  // Golf Ball specific
  current_ball?: string;
  ball_satisfaction?: string;
  ball_driver_performance?: string;
  ball_iron_performance?: string;
  ball_short_game_feel?: string;
  ball_short_game_spin?: string;
  ball_putting_feel?: string;
  ball_durability_importance?: string;
  ball_course_conditions?: string[];
  ball_budget?: string;
  ball_priorities?: string[];
  
  // Legacy fields (fallbacks)
  current_7iron_carry?: number;
  swing_tempo?: string;
  transition_speed?: string;
  swing_type?: string;
  typical_ball_flight?: string;
  most_common_miss?: string;
  driver_avg_carry?: number;
  carry_3wood?: number;
  carry_5wood?: number;
  carry_4iron?: number;
  carry_5iron?: number;
  long_iron_miss_type?: string;
  iron_7_carry?: number;
  choke_down_frequency?: string;
  iron_current_length?: string;
  iron_common_miss?: string;
  pw_loft?: number;
  wedge_current_challenge?: string[];
  
  goals_ranking?: {
    distance?: number;
    accuracy?: number;
    forgiveness?: number;
    consistency?: number;
    feel?: number;
    workability?: number;
    launch?: number;
    short_game?: number;
    putting?: number;
  };
}

interface CategoryRecommendation {
  category: string;
  length?: string;
  lieAngle?: string;
  shaftFlex?: string;
  shaftWeight?: string;
  gripSize?: string;
  headStyle?: string;
  lofts?: string;
  specifications?: Record<string, any>;
  explanation: string;
  confidence: number;
  topProducts?: Array<{
    brand: string;
    model: string;
    matchReason: string;
  }>;
}

interface GolfBallRecommendation {
  name: string;
  compression: number;
  spinRate: string;
  optimalSpeed: string;
  matchScore: number;
}

type PlayerCategory = "game_improvement" | "distance_player" | "players_iron" | "tour_oriented";

// ============================================================================
// UNIVERSAL CALCULATIONS (used across categories)
// ============================================================================

function calculateClubLength(data: FittingSessionData): { length: string; lengthInches: number; explanation: string } {
  const wtf = data.wrist_to_floor || 0;
  const heightInches = (data.height_ft || 0) * 12 + (data.height_in || 0);
  
  let baseAdjustment = 0;
  let lengthCategory = "Standard";
  
  if (heightInches < 65 || wtf < 32) {
    baseAdjustment = -0.50;
    lengthCategory = "-0.50\"";
  } else if ((heightInches >= 65 && heightInches < 67) || (wtf >= 32 && wtf < 34)) {
    baseAdjustment = -0.25;
    lengthCategory = "-0.25\"";
  } else if ((heightInches >= 67 && heightInches <= 73) || (wtf >= 34 && wtf <= 37)) {
    baseAdjustment = 0;
    lengthCategory = "Standard";
  } else if ((heightInches > 73 && heightInches <= 75) || (wtf > 37 && wtf <= 39)) {
    baseAdjustment = 0.50;
    lengthCategory = "+0.50\"";
  } else if (heightInches > 75 || wtf > 39) {
    baseAdjustment = 1.00;
    lengthCategory = "+1.00\"";
  }
  
  if (data.choke_down_frequency === "often" || data.choke_down_frequency === "always") {
    baseAdjustment -= 0.25;
  }
  
  const explanation = `Based on ${heightInches}" height and ${wtf}" wrist-to-floor measurement.`;
  
  return { length: lengthCategory, lengthInches: baseAdjustment, explanation };
}

function calculateLieAngle(data: FittingSessionData, missPattern?: string): { lieAngle: string; explanation: string } {
  const wtf = data.wrist_to_floor || 0;
  let baseAdjustment = 0;
  
  if (wtf < 33) baseAdjustment = -2;
  else if (wtf >= 33 && wtf < 35) baseAdjustment = -1;
  else if (wtf >= 35 && wtf <= 37) baseAdjustment = 0;
  else if (wtf > 37 && wtf <= 39) baseAdjustment = 1;
  else if (wtf > 39) baseAdjustment = 2;
  
  const miss = missPattern || data.most_common_miss;
  if (miss === "push" || miss === "slice") baseAdjustment += 1;
  else if (miss === "pull" || miss === "hook") baseAdjustment -= 1;
  
  baseAdjustment = Math.max(-3, Math.min(3, baseAdjustment));
  
  const lieNames = ["3° Flat", "2° Flat", "1° Flat", "Standard", "1° Upright", "2° Upright", "3° Upright"];
  const lieCategory = lieNames[baseAdjustment + 3];
  
  return { lieAngle: lieCategory, explanation: `${lieCategory} for ${wtf}" wrist-to-floor.` };
}

function calculateShaftFlex(data: FittingSessionData): { shaftFlex: string; explanation: string } {
  const swingSpeed = data.driver_swing_speed || "";
  const tempo = data.swing_tempo || data.driver_tempo || "";
  
  const flexOrder = ["L", "A", "R", "S", "X"];
  const flexNames = ["Ladies", "Senior", "Regular", "Stiff", "X-Stiff"];
  let flexIndex = 2; // Default to Regular
  
  if (swingSpeed.includes("under_70") || swingSpeed.includes("70-80") || swingSpeed.includes("under_80")) {
    flexIndex = 1;
  } else if (swingSpeed.includes("80-90")) {
    flexIndex = 2;
  } else if (swingSpeed.includes("90-100")) {
    flexIndex = 2;
  } else if (swingSpeed.includes("100-110")) {
    flexIndex = 3;
  } else if (swingSpeed.includes("110_plus") || swingSpeed.includes("110-plus")) {
    flexIndex = 4;
  }
  
  if (tempo === "smooth") flexIndex = Math.max(0, flexIndex - 1);
  else if (tempo === "aggressive") flexIndex = Math.min(flexOrder.length - 1, flexIndex + 1);
  
  return { 
    shaftFlex: flexOrder[flexIndex], 
    explanation: `${flexNames[flexIndex]} for swing speed ${swingSpeed.replace(/_/g, "-")}` 
  };
}

function calculateGripSize(data: FittingSessionData): string {
  const gloveSize = data.glove_size || "M";
  const gripMap: Record<string, string> = {
    "S": "Undersize",
    "M": "Standard",
    "ML": "Standard",
    "L": "Midsize",
    "XL": "Oversize"
  };
  return gripMap[gloveSize] || "Standard";
}

function classifyPlayer(data: FittingSessionData): PlayerCategory {
  const handicap = data.handicap_index;
  const avgScore = data.average_score;
  const goals = data.goals_ranking || {};
  
  let effectiveHandicap = handicap;
  if (!effectiveHandicap && avgScore) effectiveHandicap = avgScore - 72;
  
  if (effectiveHandicap && effectiveHandicap >= 15) return "game_improvement";
  if (effectiveHandicap && effectiveHandicap >= 8) {
    return goals.distance && goals.distance >= 4 ? "distance_player" : "game_improvement";
  }
  if (effectiveHandicap && effectiveHandicap >= 0) {
    return goals.workability && goals.workability >= 4 ? "tour_oriented" : "players_iron";
  }
  if (effectiveHandicap && effectiveHandicap < 0) return "tour_oriented";
  
  if (goals.forgiveness && goals.forgiveness >= 4) return "game_improvement";
  if (goals.workability && goals.workability >= 4) return "tour_oriented";
  
  return "game_improvement";
}

// ============================================================================
// CATEGORY-SPECIFIC RECOMMENDATION FUNCTIONS
// ============================================================================

function generateDriverRecommendation(data: FittingSessionData, playerCategory: PlayerCategory): CategoryRecommendation {
  const lengthCalc = calculateClubLength(data);
  const lieCalc = calculateLieAngle(data, data.driver_ball_flight);
  const flexCalc = calculateShaftFlex(data);
  const gripSize = calculateGripSize(data);
  
  let headStyle = "Neutral Mid-MOI";
  const ballFlight = data.driver_ball_flight || "";
  const distanceSat = data.driver_distance_satisfaction || "";
  const accuracySat = data.driver_accuracy_satisfaction || "";
  
  if (ballFlight === "slice") {
    headStyle = "Draw Bias, High MOI, 10.5-12° loft";
  } else if (ballFlight === "hook") {
    headStyle = "Neutral/Fade Bias, 9-10° loft";
  } else if (playerCategory === "game_improvement") {
    headStyle = "High Launch, Maximum Forgiveness, 10.5-11° loft";
  } else if (playerCategory === "tour_oriented") {
    headStyle = "Low Spin, Workable, 9-10° loft";
  }
  
  const confidence = (distanceSat === "satisfied" || distanceSat === "very_satisfied") && 
                     (accuracySat === "satisfied" || accuracySat === "very_satisfied") ? 90 : 85;
  
  return {
    category: "driver",
    length: lengthCalc.length,
    lieAngle: lieCalc.lieAngle,
    shaftFlex: flexCalc.shaftFlex,
    shaftWeight: data.driver_swing_speed?.includes("100") || data.driver_swing_speed?.includes("110") ? "70-80g graphite" : "60-70g graphite",
    gripSize,
    headStyle,
    explanation: `${headStyle} driver optimized for your ${ballFlight || "straight"} ball flight and ${data.driver_swing_speed || "moderate"} swing speed. ${lengthCalc.explanation} ${flexCalc.explanation}.`,
    confidence
  };
}

function generateFairwayWoodsRecommendation(data: FittingSessionData, playerCategory: PlayerCategory): CategoryRecommendation {
  const lengthCalc = calculateClubLength(data);
  const flexCalc = calculateShaftFlex(data);
  const gripSize = calculateGripSize(data);
  
  const usage = data.fairway_woods_usage || [];
  const airborne = data.fairway_airborne_difficulty || "";
  const headSizePref = data.fairway_head_size_pref || "";
  
  let recommendation = "3-Wood (15°)";
  const woods: string[] = ["3-Wood (15°)"];
  
  if (usage.includes("tee_shots") && usage.includes("fairway_approach")) {
    woods.push("5-Wood (18-19°)");
    recommendation = "3W + 5W combo";
  }
  
  let headStyle = "Standard Profile";
  if (airborne === "very_difficult" || airborne === "difficult") {
    headStyle = "High Launch, Larger Profile";
  } else if (headSizePref === "oversized") {
    headStyle = "Oversized Forgiving Profile";
  } else if (playerCategory === "tour_oriented") {
    headStyle = "Compact, Low Spin Profile";
  }
  
  return {
    category: "fairway_woods",
    length: lengthCalc.length,
    shaftFlex: flexCalc.shaftFlex,
    shaftWeight: "60-70g graphite",
    gripSize,
    headStyle,
    lofts: woods.join(", "),
    explanation: `${recommendation} with ${headStyle}. Optimized for ${usage.join(", ") || "versatile play"}. ${flexCalc.explanation}.`,
    confidence: 85
  };
}

function generateHybridsRecommendation(data: FittingSessionData, playerCategory: PlayerCategory): CategoryRecommendation {
  const lengthCalc = calculateClubLength(data);
  const flexCalc = calculateShaftFlex(data);
  const gripSize = calculateGripSize(data);
  
  const replacingIrons = data.replacing_long_irons || false;
  const usage = data.hybrid_primary_usage || [];
  const launchDiff = data.hybrid_launch_difficulty || "";
  const headStyle = data.hybrid_head_style_pref || "";
  
  let recommendation = "4-Hybrid (22-24°)";
  const hybrids: string[] = [];
  
  if (replacingIrons) {
    hybrids.push("4-Hybrid (22-24°)");
    hybrids.push("5-Hybrid (25-27°)");
    recommendation = "Replace 4i + 5i with hybrids";
  } else {
    hybrids.push("4-Hybrid or 5-Hybrid");
    recommendation = "Single hybrid for gap filling";
  }
  
  let headDescription = "Standard Hybrid Profile";
  if (launchDiff === "very_difficult" || launchDiff === "difficult") {
    headDescription = "High Launch, Game Improvement Profile";
  } else if (headStyle === "traditional") {
    headDescription = "Compact, Player's Profile";
  } else if (headStyle === "game_improvement") {
    headDescription = "Larger, Forgiving Profile";
  }
  
  return {
    category: "hybrids",
    length: lengthCalc.length,
    shaftFlex: flexCalc.shaftFlex,
    shaftWeight: "75-85g graphite/steel transition",
    gripSize,
    headStyle: headDescription,
    lofts: hybrids.join(", "),
    explanation: `${recommendation}. ${headDescription} optimized for ${usage.join(", ") || "versatile play"}. Bridges gap between woods and irons.`,
    confidence: 85
  };
}

function generateIronsRecommendation(data: FittingSessionData, playerCategory: PlayerCategory): CategoryRecommendation {
  const lengthCalc = calculateClubLength(data);
  const lieCalc = calculateLieAngle(data, data.irons_miss_pattern);
  const flexCalc = calculateShaftFlex(data);
  const gripSize = calculateGripSize(data);
  
  const ironDistance = data.irons_7iron_distance || data.iron_7_carry || data.current_7iron_carry || 0;
  const ballFlight = data.irons_ball_flight || "";
  const swingChars = data.irons_swing_characteristics || [];
  
  let shaftWeight = "95-110g steel";
  if (ironDistance < 130) shaftWeight = "60-80g graphite";
  else if (ironDistance < 150) shaftWeight = "75-95g graphite";
  else if (ironDistance >= 170) shaftWeight = "110-120g steel";
  
  let headStyle = "Game Improvement (Maximum Forgiveness)";
  if (playerCategory === "tour_oriented") {
    headStyle = "Player's Blade (Compact, Forged)";
  } else if (playerCategory === "players_iron") {
    headStyle = "Player's Distance (Mid-Size, Forged Feel)";
  } else if (playerCategory === "distance_player") {
    headStyle = "Game Improvement Distance (Strong Lofts)";
  }
  
  return {
    category: "irons",
    length: lengthCalc.length,
    lieAngle: lieCalc.lieAngle,
    shaftFlex: flexCalc.shaftFlex,
    shaftWeight,
    gripSize,
    headStyle,
    explanation: `${headStyle} matched to ${ironDistance}yd 7-iron distance. ${lieCalc.explanation} ${swingChars.join(", ") || "Standard swing profile"}. ${shaftWeight} optimizes feel and control.`,
    confidence: 88
  };
}

function generateWedgesRecommendation(data: FittingSessionData, playerCategory: PlayerCategory): CategoryRecommendation {
  const lengthCalc = calculateClubLength(data);
  const gripSize = calculateGripSize(data);
  
  const currentWedges = data.current_wedges || [];
  const pwLoft = data.pw_loft || 44;
  const swingType = data.swing_type || "neutral";
  const spinPerf = data.wedges_spin_performance || "";
  const bunkerPerf = data.wedges_bunker_performance || "";
  
  const gwLoft = pwLoft + 4;
  const swLoft = gwLoft + 6;
  const lwLoft = swLoft + 4;
  
  let bounce = "Mid bounce (10-12°)";
  if (swingType === "digger") bounce = "Higher bounce (12-14°)";
  else if (swingType === "sweeper") bounce = "Lower bounce (8-10°)";
  
  const wedges = [
    `Gap Wedge: ${gwLoft}°`,
    `Sand Wedge: ${swLoft}° with ${bounce}`,
    `Lob Wedge: ${lwLoft}°`
  ];
  
  return {
    category: "wedges",
    length: lengthCalc.length,
    gripSize,
    lofts: wedges.join(" | "),
    headStyle: `${bounce} for ${swingType} swing`,
    explanation: `Wedge setup: ${wedges.join(", ")}. ${bounce} suits your ${swingType} swing interaction with turf. Optimal 4-6° loft gaps for distance control.`,
    confidence: 85
  };
}

function generatePutterRecommendation(data: FittingSessionData): CategoryRecommendation {
  const strokeType = data.putter_stroke_pattern || data.putter_stroke_type || "";
  const miss = data.putter_common_miss || "";
  const eyePos = data.putter_eye_position || "";
  const headStylePref = data.putter_head_style_pref || "";
  
  let toeHang = "Mid Toe Hang";
  if (strokeType === "straight_back_through") toeHang = "Face Balanced";
  else if (strokeType === "slight_arc") toeHang = "Mid Toe Hang";
  else if (strokeType === "arc") toeHang = "Toe Hang";
  
  if (miss === "right") toeHang = "Increased Toe Hang";
  else if (miss === "left") toeHang = "Face Balanced";
  
  let headStyle = "Mid-Mallet";
  if (headStylePref === "blade") headStyle = "Blade";
  else if (headStylePref === "mallet") headStyle = "High-MOI Mallet";
  else if (miss === "inconsistent") headStyle = "High-MOI Mallet";
  
  const wtf = data.wrist_to_floor || 35;
  let length = "Standard (33-34\")";
  if (wtf < 33) length = "32-33\"";
  else if (wtf > 37) length = "34-35\"";
  
  const gripSize = data.putter_grip_size_pref === "midsize" ? "Midsize" : 
                   data.putter_grip_size_pref === "oversize" ? "Oversize" : "Standard";
  
  return {
    category: "putter",
    length,
    headStyle: `${headStyle}, ${toeHang}`,
    gripSize,
    explanation: `${headStyle} with ${toeHang} matches ${strokeType.replace(/_/g, " ")} stroke. ${length} suits your setup. ${gripSize} grip for optimal control.`,
    confidence: 87
  };
}

function generateGolfBallRecommendation(data: any, playerCategory: string): any {
  const swingSpeed = data.driver_swing_speed || data.seven_iron_distance;
  
  // Query will happen in the results page or via separate API call
  // For now, return empty array with proper structure
  const explanation = `Based on your swing characteristics, we'll recommend golf balls that match your speed and preferences.`;
  
  return {
    category: "golf_ball",
    specifications: {
      balls: [], // Will be populated via API query
      swing_speed: swingSpeed,
      compression_range: getCompressionRange(swingSpeed)
    },
    explanation,
    confidence_score: 85
  };
}

function getCompressionRange(swingSpeed: number): string {
  if (swingSpeed >= 105) return "90-100 (Tour level)";
  if (swingSpeed >= 95) return "80-90 (High compression)";
  if (swingSpeed >= 85) return "70-80 (Medium compression)";
  return "60-70 (Low compression)";
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID required" });
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase
      .from("fitting_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !sessionData) {
      return res.status(400).json({ error: "Fitting session not found" });
    }

    const data = sessionData as FittingSessionData;
    const selectedCategories = data.selected_categories || [];
    
    if (selectedCategories.length === 0) {
      return res.status(400).json({ error: "No categories selected for fitting" });
    }

    const playerCategory = classifyPlayer(data);
    const recommendations: CategoryRecommendation[] = [];
    let golfBalls: GolfBallRecommendation[] = [];

    // Generate recommendations ONLY for selected categories
    if (selectedCategories.includes("driver")) {
      recommendations.push(generateDriverRecommendation(data, playerCategory));
    }
    
    if (selectedCategories.includes("fairway_woods")) {
      recommendations.push(generateFairwayWoodsRecommendation(data, playerCategory));
    }
    
    if (selectedCategories.includes("hybrids")) {
      recommendations.push(generateHybridsRecommendation(data, playerCategory));
    }
    
    if (selectedCategories.includes("irons")) {
      recommendations.push(generateIronsRecommendation(data, playerCategory));
    }
    
    if (selectedCategories.includes("wedges")) {
      recommendations.push(generateWedgesRecommendation(data, playerCategory));
    }
    
    if (selectedCategories.includes("putter")) {
      recommendations.push(generatePutterRecommendation(data));
    }
    
    if (selectedCategories.includes("golf_ball")) {
      const ballRec = generateGolfBallRecommendation(data, playerCategory);
      recommendations.push(ballRec.category);
      golfBalls = ballRec.balls;
    }

    // Save to fitting_recommendations_v2 table (category-specific)
    const insertPromises = recommendations.map(rec => 
      supabase.from("fitting_recommendations_v2").insert({
        session_id: sessionId,
        user_id: data.user_id,
        category: rec.category,
        club_length: rec.length || null,
        lie_angle: rec.lieAngle || null,
        shaft_flex: rec.shaftFlex || null,
        shaft_weight: rec.shaftWeight || null,
        grip_size: rec.gripSize || null,
        head_style: rec.headStyle || null,
        lofts: rec.lofts || null,
        specifications: rec.specifications || null,
        explanation: rec.explanation,
        confidence_score: rec.confidence,
        top_products: rec.topProducts || null
      })
    );

    const results = await Promise.all(insertPromises);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      console.error("Failed to save some recommendations:", errors);
      return res.status(500).json({ 
        success: false,
        error: "Failed to save recommendations",
        details: errors
      });
    }

    // Update session status
    await supabase
      .from("fitting_sessions")
      .update({ status: "completed" })
      .eq("id", sessionId);

    return res.status(200).json({ 
      success: true,
      recommendations,
      golfBalls,
      playerCategory: playerCategory.replace(/_/g, " "),
      sessionId 
    });
    
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Failed to generate recommendations",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}