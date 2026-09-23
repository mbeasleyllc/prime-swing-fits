import { z } from "zod";

// Utility schemas
const numericString = z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid number");
const optionalNumericString = z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid number").optional().or(z.literal(""));

// Section 1: Player Profile
export const playerProfileSchema = z.object({
  player_name: z.string().min(1, "Name is required").max(100),
  player_age: z.number().int().min(10, "Age must be at least 10").max(100, "Age must be less than 100"),
  handedness: z.enum(["right", "left"], { required_error: "Please select handedness" }),
  unit_preference: z.enum(["imperial", "metric"]),
  height_ft: z.number().int().min(3).max(8).optional(),
  height_in: z.number().int().min(0).max(11).optional(),
  height_cm: z.number().min(90).max(250).optional(),
  wrist_to_floor: z.number().min(20).max(50, "Measurement seems unusually high"),
  glove_size: z.enum(["S", "M", "ML", "L", "XL"], { required_error: "Please select glove size" }),
  hand_length: z.number().min(6).max(12).optional(),
  longest_finger: z.number().min(2).max(5).optional(),
  has_physical_limitations: z.boolean(),
  physical_limitations_text: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.unit_preference === "imperial") {
      return data.height_ft !== undefined && data.height_in !== undefined;
    } else {
      return data.height_cm !== undefined;
    }
  },
  { message: "Height is required", path: ["height_ft"] }
);

// Section 2: Golf Experience & Ability
export const golfExperienceSchema = z.object({
  handicap_index: z.number().min(-5).max(54).optional(),
  average_score: z.number().int().min(60).max(150).optional(),
  years_playing: z.enum(["less_than_1", "1-3", "3-5", "5-10", "10_plus"], { required_error: "Please select years playing" }),
  playing_frequency: z.enum(["rarely", "monthly", "weekly", "multiple_weekly", "daily"], { required_error: "Please select playing frequency" }),
  practice_frequency: z.enum(["rarely", "monthly", "weekly", "multiple_weekly", "daily"], { required_error: "Please select practice frequency" }),
}).refine(
  (data) => data.handicap_index !== undefined || data.average_score !== undefined,
  { message: "Either handicap or average score is required", path: ["handicap_index"] }
);

// Section 3: Current Bag & Equipment
export const currentBagSchema = z.object({
  carries_driver: z.boolean(),
  carries_fairway_woods: z.array(z.string()).optional(),
  carries_hybrids: z.array(z.string()).optional(),
  carries_irons: z.array(z.string()).optional(),
  carries_wedges: z.array(z.string()).optional(),
  carries_putter: z.boolean(),
  driver_make: z.string().max(50).optional(),
  driver_model: z.string().max(50).optional(),
  driver_current_loft: z.number().min(7).max(15).optional(),
  driver_current_flex: z.enum(["ladies", "senior", "regular", "stiff", "x-stiff"]).optional(),
  current_7iron_carry: z.number().int().min(50).max(250),
  current_putter_length: z.number().min(28).max(40).optional(),
  current_putter_model: z.string().max(100).optional(),
});

// Section 4: Swing Characteristics
export const swingCharacteristicsSchema = z.object({
  driver_swing_speed: z.enum(["under_70", "70-80", "80-90", "90-100", "100-110", "110_plus"], { required_error: "Please select swing speed" }),
  swing_tempo: z.enum(["smooth", "moderate", "aggressive"], { required_error: "Please select tempo" }),
  transition_speed: z.enum(["smooth", "average", "quick", "very_aggressive"], { required_error: "Please select transition" }),
  swing_type: z.enum(["sweeper", "neutral", "digger"], { required_error: "Please select swing type" }),
  athletic_background: z.array(z.string()).optional(),
  typical_ball_flight: z.enum(["draw", "straight", "fade", "slice", "hook"]).optional(),
  typical_trajectory: z.enum(["low", "medium", "high"]).optional(),
  most_common_miss: z.enum(["left", "right", "short", "long", "thin", "fat"]).optional(),
  miss_percentage: z.number().int().min(0).max(100).optional(),
  fairway_accuracy: z.number().int().min(0).max(100).optional(),
});

// Section 5: Long Game (Driver + Woods/Hybrids)
export const longGameSchema = z.object({
  carry_driver: z.number().min(100).max(350).optional(),
  carry_3wood: z.number().min(100).max(300).optional(),
  carry_5wood: z.number().min(100).max(280).optional(),
  carry_4iron: z.number().min(100).max(250).optional(),
  carry_5iron: z.number().min(100).max(230).optional(),
  long_iron_trouble_club: z.array(z.string()),
  long_iron_miss_type: z.enum(["slice", "hook", "thin", "fat", "inconsistent_distance", "low_flight"]).optional(),
  hybrid_desired_flight: z.enum(["high", "mid", "penetrating"]).optional(),
  hybrid_primary_use: z.enum(["tee", "approach", "rough", "utility"]).optional(),
  driver_head_shape_pref: z.enum(["traditional", "modern", "square", "no_preference"]).optional(),
  driver_face_pref: z.enum(["open", "square", "closed", "no_preference"]).optional(),
  driver_sound_pref: z.enum(["loud", "moderate", "muted", "no_preference"]).optional(),
});

// Section 6: Iron & Wedge Fitting
export const ironWedgeFittingSchema = z.object({
  iron_7_carry: z.number().min(50).max(250).optional(),
  iron_7_flight: z.enum(["too_low", "ideal", "too_high"]).optional(),
  choke_down_frequency: z.enum(["never", "sometimes", "often", "always"]),
  iron_current_length: z.enum(["shorter", "standard", "longer", "unsure"]),
  iron_common_miss: z.enum(["slice", "push", "fade", "pull", "hook", "thin", "fat", "toe", "heel"]).optional(),
  wedge_current_challenge: z.array(z.string()),
  wedge_common_miss: z.enum(["thin", "fat", "left", "right", "short", "long"]).optional(),
  pw_loft: z.number().min(42).max(50).optional(),
});

// Section 7: Putter Fitting
export const putterFittingSchema = z.object({
  putter_eye_position: z.enum(["inside", "over", "outside", "unsure"]).optional(),
  putter_posture: z.enum(["upright", "moderate", "bent"]).optional(),
  putter_arm_hang: z.enum(["natural", "extended", "bent"]).optional(),
  putter_sole_flush: z.enum(["toe_up", "flat", "heel_up", "unsure"]).optional(),
  putter_stroke_type: z.enum(["straight", "slight_arc", "moderate_arc", "strong_arc"]).optional(),
  putter_face_rotation: z.enum(["minimal", "moderate", "significant", "unsure"]).optional(),
  putter_common_miss: z.enum(["left", "right", "short", "long", "inconsistent_speed"]).optional(),
  putter_head_style_pref: z.enum(["blade", "mid_mallet", "mallet", "no_preference"]).optional(),
  putter_alignment_pref: z.enum(["minimal", "moderate", "prominent"]).optional(),
  putter_forgiveness_priority: z.enum(["low", "moderate", "high"]).optional(),
  putter_feel_pref: z.enum(["soft", "medium", "firm"]).optional(),
  putter_green_speed: z.enum(["slow", "medium", "fast"]).optional(),
  putter_forward_press: z.enum(["yes", "no"]),
  putter_grip_size_pref: z.enum(["standard", "midsize", "oversize"]),
  putter_hand_activity: z.enum(["quiet", "moderate", "active"]).optional(),
  putter_current_length: z.number().min(28).max(40).optional(),
  putter_satisfaction: z.enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"]).optional(),
});

// Section 8: Goals & Priorities
export const goalsPrioritiesSchema = z.object({
  goals_ranking: z.object({
    distance: z.number().min(1).max(5).optional(),
    accuracy: z.number().min(1).max(5).optional(),
    consistency: z.number().min(1).max(5).optional(),
    forgiveness: z.number().min(1).max(5).optional(),
    feel: z.number().min(1).max(5).optional(),
    workability: z.number().min(1).max(5).optional(),
    launch: z.number().min(1).max(5).optional(),
    short_game: z.number().min(1).max(5).optional(),
    putting: z.number().min(1).max(5).optional(),
  }),
});

// Combined schema type for TypeScript
export type PlayerProfile = z.infer<typeof playerProfileSchema>;
export type GolfExperience = z.infer<typeof golfExperienceSchema>;
export type CurrentBag = z.infer<typeof currentBagSchema>;
export type SwingCharacteristics = z.infer<typeof swingCharacteristicsSchema>;
export type LongGame = z.infer<typeof longGameSchema>;
export type IronWedgeFitting = z.infer<typeof ironWedgeFittingSchema>;
export type PutterFitting = z.infer<typeof putterFittingSchema>;
export type GoalsPriorities = z.infer<typeof goalsPrioritiesSchema>;