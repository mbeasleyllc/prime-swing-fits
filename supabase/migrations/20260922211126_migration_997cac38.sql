-- Migration: Extend fitting_sessions for comprehensive full-bag fitting
-- Add new fields for 8-section wizard covering all clubs

-- First, update the current_step constraint to allow 8 sections
ALTER TABLE fitting_sessions DROP CONSTRAINT IF EXISTS fitting_sessions_current_step_check;
ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_current_step_check 
  CHECK (current_step >= 1 AND current_step <= 8);

-- Add unit preference (imperial/metric)
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS unit_preference text DEFAULT 'imperial';
ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_unit_preference_check 
  CHECK (unit_preference IN ('imperial', 'metric'));

-- Add player profile fields
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS player_name text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS player_age integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS handedness text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS height_ft integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS height_in integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS height_cm numeric(5,1);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS wrist_to_floor numeric(4,1);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS glove_size text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS hand_length numeric(4,1);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS longest_finger numeric(4,1);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS has_physical_limitations boolean DEFAULT false;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS physical_limitations_text text;

-- Add golf experience fields
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS handicap_index numeric(4,1);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS average_score integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS years_playing text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS playing_frequency text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS practice_frequency text;

-- Add current equipment fields
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carries_driver boolean DEFAULT true;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carries_fairway_woods text[];
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carries_hybrids text[];
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carries_irons text[];
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carries_wedges text[];
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carries_putter boolean DEFAULT true;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_make text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_model text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS current_7iron_carry integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS current_putter_length numeric(4,1);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS current_putter_model text;

-- Add swing characteristics
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_swing_speed text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS swing_tempo text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS transition_speed text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS swing_type text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS athletic_background text[];
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS typical_ball_flight text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS typical_trajectory text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS most_common_miss text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS miss_percentage integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS fairway_accuracy integer;

-- Add driver-specific fields
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_current_loft numeric(3,1);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_current_flex text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_shaft_weight integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_length numeric(4,2);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_avg_carry integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_avg_total integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_best_distance integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_ball_flight text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_trajectory text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_common_miss text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_miss_percentage integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_head_shape_pref text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_face_pref text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS driver_sound_pref text;

-- Add fairway wood/hybrid fields
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS long_iron_trouble_club text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS long_iron_miss_type text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS hybrid_primary_use text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS hybrid_desired_flight text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS distance_gap_target integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carry_3wood integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carry_5wood integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carry_4iron integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS carry_5iron integer;

-- Add iron fields
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_current_length text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS choke_down_frequency text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_7_carry integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_7_flight text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_common_miss text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_shot_shape text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_priority_miss text;
-- Optional launch monitor fields
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_ball_speed numeric(5,2);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_launch_angle numeric(4,2);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_spin_rate integer;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_peak_height numeric(5,2);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_descent_angle numeric(4,2);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS iron_dispersion numeric(5,2);

-- Add wedge fields
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS wedge_current_challenge text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS wedge_common_miss text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS pw_loft numeric(3,1);

-- Add putter fields
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_eye_position text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_posture text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_arm_hang text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_sole_flush boolean;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_stroke_type text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_face_rotation text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_common_miss text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_head_style_pref text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_alignment_pref text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_forgiveness_priority text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_feel_pref text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_green_speed text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_forward_press boolean;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_grip_size_pref text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_hand_activity text;
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_current_length numeric(4,1);
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS putter_satisfaction text;

-- Add goals ranking (structured JSONB)
ALTER TABLE fitting_sessions ADD COLUMN IF NOT EXISTS goals_ranking jsonb DEFAULT '{
  "distance": 5,
  "accuracy": 5,
  "forgiveness": 5,
  "consistency": 5,
  "feel": 5,
  "workability": 5,
  "launch": 5,
  "short_game": 5,
  "putting": 5
}'::jsonb;

-- Add constraints for categorical fields
ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_handedness_check 
  CHECK (handedness IN ('right', 'left'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_glove_size_check 
  CHECK (glove_size IN ('S', 'M', 'ML', 'L', 'XL'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_years_playing_check 
  CHECK (years_playing IN ('less_than_1', '1-3', '3-5', '5-10', '10_plus'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_playing_frequency_check 
  CHECK (playing_frequency IN ('rarely', 'monthly', 'weekly', 'multiple_weekly', 'daily'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_practice_frequency_check 
  CHECK (practice_frequency IN ('rarely', 'monthly', 'weekly', 'multiple_weekly', 'daily'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_driver_swing_speed_check 
  CHECK (driver_swing_speed IN ('under_70', '70-80', '80-90', '90-100', '100-110', '110_plus'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_swing_tempo_check 
  CHECK (swing_tempo IN ('smooth', 'moderate', 'aggressive'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_transition_speed_check 
  CHECK (transition_speed IN ('smooth', 'average', 'quick', 'very_aggressive'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_swing_type_check 
  CHECK (swing_type IN ('sweeper', 'neutral', 'digger'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_iron_current_length_check 
  CHECK (iron_current_length IN ('standard', 'longer', 'shorter', 'unsure'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_choke_down_frequency_check 
  CHECK (choke_down_frequency IN ('never', 'rarely', 'sometimes', 'often', 'always'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_iron_7_flight_check 
  CHECK (iron_7_flight IN ('too_low', 'ideal', 'too_high'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_putter_stroke_type_check 
  CHECK (putter_stroke_type IN ('straight', 'slight_arc', 'moderate_arc', 'strong_arc'));

ALTER TABLE fitting_sessions ADD CONSTRAINT fitting_sessions_putter_satisfaction_check 
  CHECK (putter_satisfaction IN ('very_dissatisfied', 'dissatisfied', 'neutral', 'satisfied', 'very_satisfied'));

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_fitting_sessions_user_status ON fitting_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_fitting_sessions_created ON fitting_sessions(created_at DESC);

-- Add comment
COMMENT ON TABLE fitting_sessions IS 'Extended fitting sessions table supporting comprehensive 8-section full-bag fitting questionnaire';