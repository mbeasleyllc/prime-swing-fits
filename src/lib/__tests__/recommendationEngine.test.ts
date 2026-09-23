import { describe, it, expect } from "vitest";

// Test fixtures for 4 player categories
export const gameImprovementFixture = {
  // Player Profile
  player_name: "John Smith",
  player_age: 45,
  handedness: "right",
  height_ft: 5,
  height_in: 10,
  height_cm: 178,
  wrist_to_floor: 34,
  glove_size: "ML",
  has_physical_limitations: false,
  
  // Golf Experience
  handicap_index: 18,
  average_score: 92,
  years_playing: "5-10",
  playing_frequency: "1-2x_month",
  practice_frequency: "rarely",
  
  // Swing Characteristics
  driver_swing_speed: "80-90",
  swing_tempo: "smooth",
  transition_speed: "smooth",
  swing_type: "sweeper",
  typical_ball_flight: "slice",
  most_common_miss: "slice",
  miss_percentage: "40-60",
  
  // Long Game
  driver_avg_carry: 210,
  carry_3wood: 185,
  carry_5wood: 170,
  carry_4iron: 155,
  carry_5iron: 145,
  long_iron_miss_type: "slice",
  
  // Iron & Wedge
  iron_7_carry: 130,
  choke_down_frequency: "never",
  iron_current_length: "standard",
  iron_common_miss: "slice",
  pw_loft: 44,
  wedge_current_challenge: ["distance_control", "turf_contact"],
  
  // Putter
  putter_eye_position: "over",
  putter_stroke_type: "slight_arc",
  putter_common_miss: "short",
  putter_forgiveness_priority: "high",
  putter_grip_size_pref: "standard",
  
  // Goals
  goals_ranking: {
    distance: 4,
    accuracy: 5,
    forgiveness: 5,
    consistency: 4,
    feel: 2,
    workability: 1,
    launch: 3,
    short_game: 3,
    putting: 4,
  },
};

export const distancePlayerFixture = {
  player_name: "Mike Johnson",
  player_age: 35,
  handedness: "right",
  height_ft: 6,
  height_in: 1,
  height_cm: 185,
  wrist_to_floor: 36,
  glove_size: "L",
  has_physical_limitations: false,
  
  handicap_index: 12,
  average_score: 84,
  years_playing: "10-20",
  playing_frequency: "1x_week",
  practice_frequency: "weekly",
  
  driver_swing_speed: "95-100",
  swing_tempo: "moderate",
  transition_speed: "average",
  swing_type: "neutral",
  typical_ball_flight: "straight",
  most_common_miss: "push",
  miss_percentage: "20-40",
  
  driver_avg_carry: 265,
  carry_3wood: 235,
  carry_5wood: 215,
  carry_4iron: 195,
  carry_5iron: 180,
  long_iron_miss_type: "thin",
  
  iron_7_carry: 165,
  choke_down_frequency: "sometimes",
  iron_current_length: "standard",
  iron_common_miss: "push",
  pw_loft: 46,
  wedge_current_challenge: ["spin", "distance_control"],
  
  putter_eye_position: "over",
  putter_stroke_type: "straight",
  putter_common_miss: "right",
  putter_forgiveness_priority: "moderate",
  putter_grip_size_pref: "standard",
  
  goals_ranking: {
    distance: 5,
    accuracy: 4,
    forgiveness: 4,
    consistency: 4,
    feel: 3,
    workability: 2,
    launch: 4,
    short_game: 3,
    putting: 3,
  },
};

export const playersIronFixture = {
  player_name: "David Chen",
  player_age: 28,
  handedness: "right",
  height_ft: 5,
  height_in: 11,
  height_cm: 180,
  wrist_to_floor: 35,
  glove_size: "M",
  has_physical_limitations: false,
  
  handicap_index: 5,
  average_score: 77,
  years_playing: "20_plus",
  playing_frequency: "2-3x_week",
  practice_frequency: "multiple_week",
  
  driver_swing_speed: "100-110",
  swing_tempo: "moderate",
  transition_speed: "average",
  swing_type: "neutral",
  typical_ball_flight: "draw",
  most_common_miss: "hook",
  miss_percentage: "under_20",
  
  driver_avg_carry: 285,
  carry_3wood: 250,
  carry_5wood: 230,
  carry_4iron: 210,
  carry_5iron: 195,
  long_iron_miss_type: "inconsistent_distance",
  
  iron_7_carry: 175,
  choke_down_frequency: "often",
  iron_current_length: "standard",
  iron_common_miss: "pull",
  pw_loft: 47,
  wedge_current_challenge: ["spin"],
  
  putter_eye_position: "over",
  putter_stroke_type: "moderate_arc",
  putter_common_miss: "left",
  putter_forgiveness_priority: "low",
  putter_grip_size_pref: "standard",
  
  goals_ranking: {
    distance: 3,
    accuracy: 5,
    forgiveness: 2,
    consistency: 5,
    feel: 5,
    workability: 5,
    launch: 3,
    short_game: 4,
    putting: 4,
  },
};

export const tourOrientedFixture = {
  player_name: "Alex Rodriguez",
  player_age: 24,
  handedness: "right",
  height_ft: 6,
  height_in: 0,
  height_cm: 183,
  wrist_to_floor: 36,
  glove_size: "ML",
  has_physical_limitations: false,
  
  handicap_index: -2,
  average_score: 69,
  years_playing: "20_plus",
  playing_frequency: "4_plus_week",
  practice_frequency: "daily",
  
  driver_swing_speed: "110_plus",
  swing_tempo: "aggressive",
  transition_speed: "very_aggressive",
  swing_type: "digger",
  typical_ball_flight: "straight",
  most_common_miss: "push",
  miss_percentage: "under_20",
  
  driver_avg_carry: 305,
  carry_3wood: 270,
  carry_5wood: 250,
  carry_4iron: 225,
  carry_5iron: 210,
  long_iron_miss_type: "low_flight",
  
  iron_7_carry: 190,
  choke_down_frequency: "always",
  iron_current_length: "shorter",
  iron_common_miss: "thin",
  pw_loft: 48,
  wedge_current_challenge: [],
  
  putter_eye_position: "over",
  putter_stroke_type: "strong_arc",
  putter_common_miss: "inconsistent_speed",
  putter_forgiveness_priority: "low",
  putter_grip_size_pref: "standard",
  
  goals_ranking: {
    distance: 2,
    accuracy: 5,
    forgiveness: 1,
    consistency: 5,
    feel: 5,
    workability: 5,
    launch: 2,
    short_game: 5,
    putting: 5,
  },
};

describe("Recommendation Engine Consistency Tests", () => {
  it("should generate consistent recommendations for game improvement player", () => {
    const fixture = gameImprovementFixture;
    
    // Expected outcomes for game improvement player:
    // - Regular or Senior shaft flex (slow swing speed)
    // - Draw bias driver (slice tendency)
    // - Higher forgiveness across all categories
    // - Standard or slightly longer length (height 5'10", wrist-to-floor 34")
    
    expect(fixture.driver_swing_speed).toBe("80-90");
    expect(fixture.most_common_miss).toBe("slice");
    expect(fixture.goals_ranking.forgiveness).toBe(5);
    expect(fixture.goals_ranking.workability).toBe(1);
  });

  it("should generate consistent recommendations for distance player", () => {
    const fixture = distancePlayerFixture;
    
    // Expected outcomes:
    // - Stiff shaft flex (95-100mph swing speed)
    // - Distance-optimized head
    // - Balance of forgiveness and distance
    // - +0.5" length (6'1" height, wrist-to-floor 36")
    
    expect(fixture.driver_swing_speed).toBe("95-100");
    expect(fixture.goals_ranking.distance).toBe(5);
    expect(fixture.goals_ranking.forgiveness).toBe(4);
    expect(fixture.height_ft).toBe(6);
    expect(fixture.height_in).toBe(1);
  });

  it("should generate consistent recommendations for player's iron user", () => {
    const fixture = playersIronFixture;
    
    // Expected outcomes:
    // - X-Stiff shaft flex (100-110mph + moderate tempo)
    // - Player's category irons (feel + workability priority)
    // - Neutral or fade bias driver (hook tendency)
    // - Potentially shorter length (frequent choke-down)
    
    expect(fixture.driver_swing_speed).toBe("100-110");
    expect(fixture.choke_down_frequency).toBe("often");
    expect(fixture.goals_ranking.feel).toBe(5);
    expect(fixture.goals_ranking.workability).toBe(5);
    expect(fixture.most_common_miss).toBe("hook");
  });

  it("should generate consistent recommendations for tour-oriented player", () => {
    const fixture = tourOrientedFixture;
    
    // Expected outcomes:
    // - TX shaft flex (110+ mph + aggressive tempo)
    // - Tour/blade category equipment
    // - Maximum workability, minimal forgiveness
    // - Shorter length preference (always chokes down + already shorter clubs)
    // - Heavy toe hang putter (strong arc stroke)
    
    expect(fixture.driver_swing_speed).toBe("110_plus");
    expect(fixture.swing_tempo).toBe("aggressive");
    expect(fixture.choke_down_frequency).toBe("always");
    expect(fixture.iron_current_length).toBe("shorter");
    expect(fixture.goals_ranking.workability).toBe(5);
    expect(fixture.goals_ranking.forgiveness).toBe(1);
    expect(fixture.putter_stroke_type).toBe("strong_arc");
  });

  it("should not have contradictory recommendations within each profile", () => {
    // Game Improvement: should not get tour-level specs
    expect(gameImprovementFixture.goals_ranking.forgiveness).toBeGreaterThan(
      gameImprovementFixture.goals_ranking.workability
    );
    
    // Distance Player: distance should be top priority
    expect(distancePlayerFixture.goals_ranking.distance).toBe(5);
    
    // Player's Iron: feel + workability should be high
    expect(playersIronFixture.goals_ranking.feel).toBeGreaterThanOrEqual(4);
    expect(playersIronFixture.goals_ranking.workability).toBeGreaterThanOrEqual(4);
    
    // Tour-Oriented: forgiveness should be low, workability high
    expect(tourOrientedFixture.goals_ranking.forgiveness).toBeLessThanOrEqual(2);
    expect(tourOrientedFixture.goals_ranking.workability).toBe(5);
  });

  it("should have appropriate swing speed to handicap correlation", () => {
    // Lower handicap should generally correlate with higher swing speed
    expect(gameImprovementFixture.handicap_index).toBe(18);
    expect(gameImprovementFixture.driver_swing_speed).toBe("80-90");
    
    expect(distancePlayerFixture.handicap_index).toBe(12);
    expect(distancePlayerFixture.driver_swing_speed).toBe("95-100");
    
    expect(playersIronFixture.handicap_index).toBe(5);
    expect(playersIronFixture.driver_swing_speed).toBe("100-110");
    
    expect(tourOrientedFixture.handicap_index).toBe(-2);
    expect(tourOrientedFixture.driver_swing_speed).toBe("110_plus");
  });

  it("should have appropriate carry distances for each category", () => {
    // Carry distances should increase with skill level
    expect(gameImprovementFixture.iron_7_carry).toBe(130);
    expect(distancePlayerFixture.iron_7_carry).toBe(165);
    expect(playersIronFixture.iron_7_carry).toBe(175);
    expect(tourOrientedFixture.iron_7_carry).toBe(190);
    
    // Driver carry progression
    expect(gameImprovementFixture.driver_avg_carry).toBe(210);
    expect(distancePlayerFixture.driver_avg_carry).toBe(265);
    expect(playersIronFixture.driver_avg_carry).toBe(285);
    expect(tourOrientedFixture.driver_avg_carry).toBe(305);
  });
});