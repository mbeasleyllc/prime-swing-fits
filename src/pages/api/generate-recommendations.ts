import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { GOLF_BALL_DATABASE } from "@/data/golfBallDatabase";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// TYPES
// ============================================================================

interface FittingSessionData {
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
  handicap_index?: number;
  average_score?: number;
  years_playing?: string;
  
  // Current Bag
  current_7iron_carry?: number;
  
  // Swing Characteristics
  driver_swing_speed?: string;
  swing_tempo?: string;
  transition_speed?: string;
  swing_type?: string;
  typical_ball_flight?: string;
  most_common_miss?: string;
  
  // Long Game
  driver_avg_carry?: number;
  carry_3wood?: number;
  carry_5wood?: number;
  carry_4iron?: number;
  carry_5iron?: number;
  long_iron_miss_type?: string;
  
  // Iron & Wedge
  iron_7_carry?: number;
  choke_down_frequency?: string;
  iron_current_length?: string;
  iron_common_miss?: string;
  pw_loft?: number;
  wedge_current_challenge?: string[];
  
  // Putter
  putter_eye_position?: string;
  putter_stroke_type?: string;
  putter_common_miss?: string;
  putter_forgiveness_priority?: string;
  putter_current_length?: number;
  putter_grip_size_pref?: string;
  
  // Goals
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
  
  user_id?: string;
}

interface ClubRecommendation {
  length: string;
  lieAngle: string;
  shaftFlex: string;
  shaftWeight: string;
  gripSize: string;
  headStyle: string;
  explanation: string;
}

interface FullBagRecommendations {
  driver: ClubRecommendation;
  fairwayWood: ClubRecommendation;
  hybrid: ClubRecommendation;
  irons: ClubRecommendation;
  wedges: ClubRecommendation;
  putter: ClubRecommendation;
  golfBalls: Array<{
    name: string;
    compression: number;
    spinRate: string;
    optimalSpeed: string;
    matchScore: number;
  }>;
  playerCategory: string;
}

type PlayerCategory = "game_improvement" | "distance_player" | "players_iron" | "tour_oriented";

// ============================================================================
// CLUB LENGTH CALCULATION
// ============================================================================

function calculateClubLength(data: FittingSessionData): { length: string; lengthInches: number; explanation: string } {
  const wtf = data.wrist_to_floor || 0;
  const heightInches = (data.height_ft || 0) * 12 + (data.height_in || 0);
  
  let baseAdjustment = 0;
  let lengthCategory = "Standard";
  
  // Primary determination: height + wrist-to-floor
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
  
  // Adjustments
  const adjustments: string[] = [];
  
  if (data.choke_down_frequency === "often" || data.choke_down_frequency === "always") {
    baseAdjustment -= 0.25;
    adjustments.push("shortened for frequent choke-down habit");
  }
  
  // Note: arm length would require additional measurements not in current schema
  
  const explanation = `Based on your ${heightInches}" height and ${wtf}" wrist-to-floor measurement${adjustments.length > 0 ? ", " + adjustments.join(", ") : ""}. This optimizes your setup posture and swing plane.`;
  
  return {
    length: lengthCategory,
    lengthInches: baseAdjustment,
    explanation
  };
}

// ============================================================================
// LIE ANGLE CALCULATION
// ============================================================================

function calculateLieAngle(data: FittingSessionData): { lieAngle: string; explanation: string } {
  const wtf = data.wrist_to_floor || 0;
  
  let baseAdjustment = 0;
  let lieCategory = "Standard";
  
  // Base from wrist-to-floor
  if (wtf < 33) {
    baseAdjustment = -2;
    lieCategory = "2° Flat";
  } else if (wtf >= 33 && wtf < 35) {
    baseAdjustment = -1;
    lieCategory = "1° Flat";
  } else if (wtf >= 35 && wtf <= 37) {
    baseAdjustment = 0;
    lieCategory = "Standard";
  } else if (wtf > 37 && wtf <= 39) {
    baseAdjustment = 1;
    lieCategory = "1° Upright";
  } else if (wtf > 39) {
    baseAdjustment = 2;
    lieCategory = "2° Upright";
  }
  
  // Miss pattern fine-tuning
  const miss = data.iron_common_miss || data.most_common_miss;
  if (miss === "push" || miss === "slice") {
    baseAdjustment += 1;
  } else if (miss === "pull" || miss === "hook") {
    baseAdjustment -= 1;
  }
  
  // Cap at ±3°
  baseAdjustment = Math.max(-3, Math.min(3, baseAdjustment));
  
  // Update category based on final adjustment
  if (baseAdjustment === -3) lieCategory = "3° Flat";
  else if (baseAdjustment === -2) lieCategory = "2° Flat";
  else if (baseAdjustment === -1) lieCategory = "1° Flat";
  else if (baseAdjustment === 0) lieCategory = "Standard";
  else if (baseAdjustment === 1) lieCategory = "1° Upright";
  else if (baseAdjustment === 2) lieCategory = "2° Upright";
  else if (baseAdjustment === 3) lieCategory = "3° Upright";
  
  const explanation = `${lieCategory} lie angle matches your ${wtf}" wrist-to-floor and promotes square impact${miss ? ` (adjusted for ${miss} tendency)` : ""}.`;
  
  return { lieAngle: lieCategory, explanation };
}

// ============================================================================
// SHAFT FLEX CALCULATION
// ============================================================================

function calculateShaftFlex(data: FittingSessionData): { shaftFlex: string; explanation: string } {
  const swingSpeed = data.driver_swing_speed || "";
  const tempo = data.swing_tempo || "";
  
  let baseFlex = "Regular";
  
  // Determine base flex from swing speed
  if (swingSpeed.includes("under_70") || swingSpeed.includes("70-80")) {
    baseFlex = "Senior";
  } else if (swingSpeed.includes("80-90")) {
    baseFlex = "Regular";
  } else if (swingSpeed.includes("90-100")) {
    baseFlex = "Regular"; // Will be modified by tempo
  } else if (swingSpeed.includes("100-110")) {
    baseFlex = "Stiff";
  } else if (swingSpeed.includes("110_plus")) {
    baseFlex = "X-Stiff";
  }
  
  // Tempo modifier
  const flexOrder = ["Ladies", "Senior", "Regular", "Stiff", "X-Stiff", "TX"];
  let flexIndex = flexOrder.indexOf(baseFlex);
  
  if (tempo === "smooth") {
    flexIndex = Math.max(0, flexIndex - 1); // Soften one step
  } else if (tempo === "aggressive") {
    flexIndex = Math.min(flexOrder.length - 1, flexIndex + 1); // Stiffen one step
  }
  
  const finalFlex = flexOrder[flexIndex];
  
  const explanation = `${finalFlex} flex matches your ${swingSpeed.replace(/_/g, " ")} swing speed${tempo !== "moderate" ? ` with ${tempo} tempo` : ""}. This optimizes energy transfer and control.`;
  
  return { shaftFlex: finalFlex, explanation };
}

// ============================================================================
// SHAFT WEIGHT CALCULATION
// ============================================================================

function calculateShaftWeight(data: FittingSessionData, clubType: "driver" | "irons"): { shaftWeight: string; explanation: string } {
  const swingSpeed = data.driver_swing_speed || "";
  const ironCarry = data.iron_7_carry || data.current_7iron_carry || 0;
  
  let weightRange = "60-70g";
  let material = "graphite";
  
  if (clubType === "driver") {
    // By swing speed path for driver
    if (swingSpeed.includes("under_70") || swingSpeed.includes("70-80")) {
      weightRange = "40-50g";
    } else if (swingSpeed.includes("80-90")) {
      weightRange = "50-60g";
    } else if (swingSpeed.includes("90-100")) {
      weightRange = "60-70g";
    } else if (swingSpeed.includes("100-110") || swingSpeed.includes("110_plus")) {
      weightRange = "70-80g";
    }
  } else {
    // By 7-iron carry distance for irons
    if (ironCarry < 130) {
      weightRange = "60-80g";
      material = "graphite";
    } else if (ironCarry >= 130 && ironCarry < 150) {
      weightRange = "75-95g";
      material = "graphite";
    } else if (ironCarry >= 150 && ironCarry < 170) {
      weightRange = "95-110g";
      material = "steel";
    } else if (ironCarry >= 170 && ironCarry < 190) {
      weightRange = "110-120g";
      material = "steel";
    } else if (ironCarry >= 190) {
      weightRange = "120-130g";
      material = "steel";
    }
  }
  
  const explanation = clubType === "driver" 
    ? `${weightRange} ${material} shaft optimizes your swing speed and tempo for maximum distance and control.`
    : `${weightRange} ${material} shaft matches your ${ironCarry}yd 7-iron carry distance, providing optimal feel and consistency.`;
  
  return { shaftWeight: `${weightRange} ${material}`, explanation };
}

// ============================================================================
// GRIP SIZE CALCULATION
// ============================================================================

function calculateGripSize(data: FittingSessionData): { gripSize: string; explanation: string } {
  const gloveSize = data.glove_size || "M";
  
  const gripSizeMap: Record<string, string> = {
    "S": "Undersize",
    "M": "Standard",
    "ML": "Standard",
    "L": "Midsize",
    "XL": "Oversize"
  };
  
  const gripSize = gripSizeMap[gloveSize] || "Standard";
  
  return {
    gripSize,
    explanation: `${gripSize} grip matches your ${gloveSize} glove size for optimal comfort and control.`
  };
}

// ============================================================================
// DRIVER HEAD SELECTION
// ============================================================================

function selectDriverHead(data: FittingSessionData, playerCategory: PlayerCategory): { headStyle: string; explanation: string } {
  const miss = data.most_common_miss || "";
  const ballFlight = data.typical_ball_flight || "";
  const goals = data.goals_ranking || {};
  
  let headStyle = "Neutral, Mid-MOI";
  const features: string[] = [];
  
  // Miss pattern priority
  if (miss === "right" || ballFlight === "slice") {
    headStyle = "Draw Bias, Maximum Forgiveness";
    features.push("draw-bias weighting");
    features.push("high MOI for forgiveness");
    features.push("higher loft (10.5-12°) for launch");
  } else if (miss === "left" || ballFlight === "hook") {
    headStyle = "Neutral or Fade Bias";
    features.push("neutral/fade weighting");
    features.push("lower loft (9-10°)");
  } else if (ballFlight === "straight" && goals.accuracy && goals.accuracy >= 4) {
    headStyle = "Maximum MOI, High Forgiveness";
    features.push("maximum MOI for accuracy");
  }
  
  // Player category bias
  if (playerCategory === "game_improvement" && !features.length) {
    headStyle = "High Launch, Maximum Forgiveness";
    features.push("large profile");
    features.push("high MOI");
    features.push("adjustable weighting");
  } else if (playerCategory === "tour_oriented" && !features.length) {
    headStyle = "Low Spin, Workable";
    features.push("compact profile");
    features.push("low CG");
    features.push("workability");
  }
  
  const explanation = `${headStyle} head recommended${features.length ? " with " + features.join(", ") : ""} to optimize your ball flight and shot pattern.`;
  
  return { headStyle, explanation };
}

// ============================================================================
// FAIRWAY WOOD / HYBRID GAPPING
// ============================================================================

function calculateWoodHybridGapping(data: FittingSessionData): { headStyle: string; explanation: string } {
  const driverCarry = data.driver_avg_carry || 0;
  const fiveIronCarry = data.carry_5iron || data.carry_4iron || 0;
  
  const distanceGap = driverCarry - fiveIronCarry;
  
  let recommendation = "";
  let clubs: string[] = [];
  
  if (distanceGap < 50) {
    recommendation = "No hybrid needed";
    clubs = ["3-wood (15°) optional"];
  } else if (distanceGap >= 50 && distanceGap < 80) {
    recommendation = "Add 1 hybrid";
    clubs = ["3-wood (15°)", "4-hybrid (22-24°) or 5-hybrid (25-27°)"];
  } else if (distanceGap >= 80 && distanceGap < 120) {
    recommendation = "Add 2 hybrids";
    clubs = ["3-wood (15°)", "4-hybrid (22-24°)", "5-hybrid (25-27°)"];
  } else {
    recommendation = "Add fairway wood + hybrids";
    clubs = ["3-wood (15°)", "5-wood (18-19°)", "4-hybrid (22-24°)", "5-hybrid (25-27°)"];
  }
  
  const explanation = `Your ${distanceGap}yd gap between driver and long irons suggests: ${clubs.join(", ")}. This creates optimal distance spacing throughout your bag.`;
  
  return {
    headStyle: recommendation,
    explanation
  };
}

// ============================================================================
// WEDGE GAPPING
// ============================================================================

function calculateWedgeGapping(data: FittingSessionData): { headStyle: string; explanation: string } {
  const pwLoft = data.pw_loft || 44;
  const swingType = data.swing_type || "neutral";
  
  // Calculate wedge lofts with 4-6° gaps
  const gwLoft = pwLoft + 4;
  const swLoft = gwLoft + 6;
  const lwLoft = swLoft + 4;
  
  // Bounce selection
  let bounce = "Mid bounce (10-12°)";
  if (swingType === "digger") {
    bounce = "Higher bounce (12-14°)";
  } else if (swingType === "sweeper") {
    bounce = "Lower bounce (8-10°)";
  }
  
  const wedges = [
    `Gap Wedge: ${gwLoft}°`,
    `Sand Wedge: ${swLoft}° with ${bounce}`,
    `Lob Wedge: ${lwLoft}°`
  ];
  
  const explanation = `Based on your ${pwLoft}° pitching wedge and ${swingType} swing type: ${wedges.join(", ")}. This provides optimal distance control and turf interaction.`;
  
  return {
    headStyle: wedges.join(" | "),
    explanation
  };
}

// ============================================================================
// PUTTER FITTING
// ============================================================================

function calculatePutterSpecs(data: FittingSessionData, lengthCalc: { lengthInches: number }): { length: string; lieAngle: string; headStyle: string; explanation: string } {
  const strokeType = data.putter_stroke_type || "";
  const miss = data.putter_common_miss || "";
  const eyePosition = data.putter_eye_position || "";
  const forgiveness = data.putter_forgiveness_priority || "";
  
  // Toe hang from stroke type
  let toeHang = "Mid Toe Hang";
  if (strokeType === "straight") {
    toeHang = "Face Balanced";
  } else if (strokeType === "slight_arc") {
    toeHang = "Mid Toe Hang";
  } else if (strokeType === "moderate_arc") {
    toeHang = "Toe Hang";
  } else if (strokeType === "strong_arc") {
    toeHang = "Heavy Toe Hang";
  }
  
  // Adjust for miss pattern
  if (miss === "right") {
    toeHang = "Increased Toe Hang (prevents face open)";
  } else if (miss === "left") {
    toeHang = "Face Balanced (prevents face closed)";
  }
  
  // Head style from forgiveness + miss
  let headStyle = "Mid-Mallet";
  if (forgiveness === "high" || miss === "inconsistent_speed") {
    headStyle = "High-MOI Mallet";
  } else if (forgiveness === "low") {
    headStyle = "Blade";
  }
  
  // Length from eye position
  const basePutterLength = 33 + (lengthCalc.lengthInches * 0.5); // Scale iron adjustment to putter range
  let putterLength = basePutterLength;
  
  if (eyePosition === "outside") {
    putterLength += 1;
  } else if (eyePosition === "inside") {
    putterLength -= 0.5;
  }
  
  const lengthStr = putterLength === 33 ? "Standard (33\")" : putterLength > 33 ? `+${(putterLength - 33).toFixed(1)}\" (${putterLength.toFixed(1)}\")` : `${(putterLength - 33).toFixed(1)}\" (${putterLength.toFixed(1)}\")`;
  
  // Lie angle (same calculation as irons, but typically putter-specific)
  const wtf = data.wrist_to_floor || 35;
  let lieAngle = "Standard (70°)";
  if (wtf < 33) lieAngle = "Flat (68-69°)";
  else if (wtf > 37) lieAngle = "Upright (71-72°)";
  
  const explanation = `${headStyle} with ${toeHang} matches your ${strokeType.replace(/_/g, " ")} stroke pattern. ${lengthStr} length suits your ${eyePosition || "standard"} eye position. This setup promotes consistent roll and distance control.`;
  
  return {
    length: lengthStr,
    lieAngle,
    headStyle: `${headStyle}, ${toeHang}`,
    explanation
  };
}

// ============================================================================
// PLAYER CATEGORY CLASSIFICATION
// ============================================================================

function classifyPlayer(data: FittingSessionData): PlayerCategory {
  const goals = data.goals_ranking || {};
  const handicap = data.handicap_index;
  const avgScore = data.average_score;
  
  // Derive effective handicap
  let effectiveHandicap = handicap;
  if (!effectiveHandicap && avgScore) {
    effectiveHandicap = avgScore - 72; // Rough approximation
  }
  
  // Score goals
  const distanceScore = goals.distance || 3;
  const forgivenessScore = goals.forgiveness || 3;
  const feelScore = goals.feel || 3;
  const workabilityScore = goals.workability || 3;
  
  // Classification logic
  if (effectiveHandicap && effectiveHandicap >= 15) {
    return "game_improvement";
  } else if (effectiveHandicap && effectiveHandicap >= 8 && effectiveHandicap < 15) {
    if (distanceScore >= 4) return "distance_player";
    return "game_improvement";
  } else if (effectiveHandicap && effectiveHandicap >= 0 && effectiveHandicap < 8) {
    if (workabilityScore >= 4 && feelScore >= 4) return "tour_oriented";
    return "players_iron";
  } else if (effectiveHandicap && effectiveHandicap < 0) {
    return "tour_oriented";
  }
  
  // Fallback based on goals alone
  if (forgivenessScore >= 4) return "game_improvement";
  if (workabilityScore >= 4 && feelScore >= 4) return "tour_oriented";
  if (distanceScore >= 4) return "distance_player";
  
  return "game_improvement";
}

// ============================================================================
// GOLF BALL MATCHING (Keep existing logic)
// ============================================================================

function matchGolfBalls(data: FittingSessionData, playerCategory: PlayerCategory): Array<{ name: string; compression: number; spinRate: string; optimalSpeed: string; matchScore: number }> {
  const swingSpeed = data.driver_swing_speed || "90-100";
  const goals = data.goals_ranking || {};
  
  // Convert swing speed range to mph value
  let speedMph = 95;
  if (swingSpeed.includes("under_70")) speedMph = 65;
  else if (swingSpeed.includes("70-80")) speedMph = 75;
  else if (swingSpeed.includes("80-90")) speedMph = 85;
  else if (swingSpeed.includes("90-100")) speedMph = 95;
  else if (swingSpeed.includes("100-110")) speedMph = 105;
  else if (swingSpeed.includes("110_plus")) speedMph = 115;
  
  // Score each ball
  const scoredBalls = GOLF_BALL_DATABASE.map(ball => {
    let score = 100;
    
    // Speed matching (most important)
    const speedDiff = Math.abs(ball.optimalSwingSpeed - speedMph);
    score -= speedDiff * 2;
    
    // Compression matching
    if (speedMph < 85 && ball.compression > 90) score -= 20;
    if (speedMph > 105 && ball.compression < 80) score -= 20;
    
    // Goal alignment
    if (goals.distance && goals.distance >= 4 && ball.characteristics.includes("distance")) score += 10;
    if (goals.feel && goals.feel >= 4 && ball.characteristics.includes("soft feel")) score += 10;
    if (goals.workability && goals.workability >= 4 && ball.spinRate === "High") score += 10;
    
    // Player category alignment
    if (playerCategory === "game_improvement" && ball.playerType === "All") score += 5;
    if (playerCategory === "tour_oriented" && ball.playerType === "Advanced") score += 10;
    
    return {
      name: ball.name,
      compression: ball.compression,
      spinRate: ball.spinRate,
      optimalSpeed: `${ball.optimalSwingSpeed} mph`,
      matchScore: Math.max(0, Math.min(100, score))
    };
  });
  
  // Return top 5
  return scoredBalls
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
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
    // Fetch fitting session data
    const { data: sessionData, error: sessionError } = await supabase
      .from("fitting_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !sessionData) {
      return res.status(400).json({ error: "Fitting session not found" });
    }

    const data = sessionData as FittingSessionData;

    // Classify player
    const playerCategory = classifyPlayer(data);
    
    // Calculate specs
    const lengthCalc = calculateClubLength(data);
    const lieCalc = calculateLieAngle(data);
    const flexCalc = calculateShaftFlex(data);
    const driverWeightCalc = calculateShaftWeight(data, "driver");
    const ironWeightCalc = calculateShaftWeight(data, "irons");
    const gripCalc = calculateGripSize(data);
    const driverHeadCalc = selectDriverHead(data, playerCategory);
    const woodHybridCalc = calculateWoodHybridGapping(data);
    const wedgeCalc = calculateWedgeGapping(data);
    const putterCalc = calculatePutterSpecs(data, lengthCalc);
    const golfBalls = matchGolfBalls(data, playerCategory);

    // Build full bag recommendations
    const recommendations: FullBagRecommendations = {
      driver: {
        length: lengthCalc.length,
        lieAngle: lieCalc.lieAngle,
        shaftFlex: flexCalc.shaftFlex,
        shaftWeight: driverWeightCalc.shaftWeight,
        gripSize: gripCalc.gripSize,
        headStyle: driverHeadCalc.headStyle,
        explanation: `${lengthCalc.explanation} ${driverHeadCalc.explanation} ${flexCalc.explanation} ${driverWeightCalc.explanation}`
      },
      fairwayWood: {
        length: `${lengthCalc.length} (proportional)`,
        lieAngle: lieCalc.lieAngle,
        shaftFlex: flexCalc.shaftFlex,
        shaftWeight: driverWeightCalc.shaftWeight,
        gripSize: gripCalc.gripSize,
        headStyle: woodHybridCalc.headStyle,
        explanation: woodHybridCalc.explanation
      },
      hybrid: {
        length: `${lengthCalc.length} (proportional)`,
        lieAngle: lieCalc.lieAngle,
        shaftFlex: flexCalc.shaftFlex,
        shaftWeight: `Transition weight (${driverWeightCalc.shaftWeight.split(" ")[0]} to ${ironWeightCalc.shaftWeight.split(" ")[0]})`,
        gripSize: gripCalc.gripSize,
        headStyle: woodHybridCalc.headStyle,
        explanation: `Hybrids bridge the gap between woods and irons with optimized launch and forgiveness. ${woodHybridCalc.explanation}`
      },
      irons: {
        length: lengthCalc.length,
        lieAngle: lieCalc.lieAngle,
        shaftFlex: flexCalc.shaftFlex,
        shaftWeight: ironWeightCalc.shaftWeight,
        gripSize: gripCalc.gripSize,
        headStyle: playerCategory === "tour_oriented" ? "Player's Iron (compact, forged)" : playerCategory === "players_iron" ? "Player's Distance Iron" : playerCategory === "distance_player" ? "Game Improvement with Distance" : "Game Improvement (maximum forgiveness)",
        explanation: `${ironWeightCalc.explanation} ${lieCalc.explanation} Optimized for ${playerCategory.replace(/_/g, " ")} category.`
      },
      wedges: {
        length: lengthCalc.length,
        lieAngle: lieCalc.lieAngle,
        shaftFlex: flexCalc.shaftFlex,
        shaftWeight: ironWeightCalc.shaftWeight,
        gripSize: gripCalc.gripSize,
        headStyle: wedgeCalc.headStyle,
        explanation: wedgeCalc.explanation
      },
      putter: {
        length: putterCalc.length,
        lieAngle: putterCalc.lieAngle,
        shaftFlex: "N/A",
        shaftWeight: "N/A",
        gripSize: data.putter_grip_size_pref === "midsize" ? "Midsize" : data.putter_grip_size_pref === "oversize" ? "Oversize" : "Standard",
        headStyle: putterCalc.headStyle,
        explanation: putterCalc.explanation
      },
      golfBalls,
      playerCategory: playerCategory.replace(/_/g, " ")
    };

    // Save recommendations to database
    const { error: updateError } = await supabase
      .from("fitting_sessions")
      .update({
        recommendations: recommendations as any,
        status: "completed"
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Failed to save recommendations:", updateError);
      return res.status(500).json({ error: "Failed to save recommendations" });
    }

    return res.status(200).json({ 
      success: true,
      recommendations,
      sessionId 
    });
    
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
}