-- Comprehensive migration: Add ALL category-specific fields for phase 3 questionnaires

-- Irons fields
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS irons_current_make TEXT,
ADD COLUMN IF NOT EXISTS irons_current_model TEXT,
ADD COLUMN IF NOT EXISTS irons_custom_fitted TEXT,
ADD COLUMN IF NOT EXISTS irons_set_composition TEXT,
ADD COLUMN IF NOT EXISTS irons_7iron_distance NUMERIC,
ADD COLUMN IF NOT EXISTS irons_ball_flight TEXT,
ADD COLUMN IF NOT EXISTS irons_shot_shape TEXT,
ADD COLUMN IF NOT EXISTS irons_miss_pattern JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS irons_consistency TEXT,
ADD COLUMN IF NOT EXISTS irons_turf_interaction TEXT,
ADD COLUMN IF NOT EXISTS irons_trajectory_preference TEXT,
ADD COLUMN IF NOT EXISTS irons_workability_importance TEXT,
ADD COLUMN IF NOT EXISTS irons_forgiveness_priority TEXT,
ADD COLUMN IF NOT EXISTS irons_length_preference TEXT,
ADD COLUMN IF NOT EXISTS irons_choke_down_frequency TEXT;

-- Putter fields
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS putter_current_length NUMERIC,
ADD COLUMN IF NOT EXISTS putter_current_make TEXT,
ADD COLUMN IF NOT EXISTS putter_current_model TEXT,
ADD COLUMN IF NOT EXISTS putter_eye_position TEXT,
ADD COLUMN IF NOT EXISTS putter_posture TEXT,
ADD COLUMN IF NOT EXISTS putter_stroke_type TEXT,
ADD COLUMN IF NOT EXISTS putter_common_miss TEXT,
ADD COLUMN IF NOT EXISTS putter_head_style_pref TEXT,
ADD COLUMN IF NOT EXISTS putter_alignment_pref TEXT,
ADD COLUMN IF NOT EXISTS putter_feel_pref TEXT,
ADD COLUMN IF NOT EXISTS putter_grip_size_pref TEXT,
ADD COLUMN IF NOT EXISTS putter_satisfaction TEXT;

-- Golf ball fields
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS ball_current_brand TEXT,
ADD COLUMN IF NOT EXISTS ball_current_model TEXT,
ADD COLUMN IF NOT EXISTS ball_satisfaction TEXT,
ADD COLUMN IF NOT EXISTS ball_driver_performance TEXT,
ADD COLUMN IF NOT EXISTS ball_driver_distance_satisfaction TEXT,
ADD COLUMN IF NOT EXISTS ball_iron_spin TEXT,
ADD COLUMN IF NOT EXISTS ball_iron_stopping_power TEXT,
ADD COLUMN IF NOT EXISTS ball_wedge_spin TEXT,
ADD COLUMN IF NOT EXISTS ball_greenside_feel TEXT,
ADD COLUMN IF NOT EXISTS ball_putting_feel_pref TEXT,
ADD COLUMN IF NOT EXISTS ball_putting_sound_pref TEXT,
ADD COLUMN IF NOT EXISTS ball_durability_importance TEXT,
ADD COLUMN IF NOT EXISTS ball_course_conditions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ball_primary_priorities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ball_budget TEXT;

-- Fairway woods fields (for future implementation)
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS fairway_woods_current_make TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_current_models JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS fairway_woods_usage_frequency TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_primary_use TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_yardage_gaps TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_shot_shape TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_trajectory TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_airborne_difficulty TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_head_size_pref TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_adjustability_importance TEXT;

-- Hybrid fields (for future implementation)
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS hybrids_current_setup TEXT,
ADD COLUMN IF NOT EXISTS hybrids_replacing TEXT,
ADD COLUMN IF NOT EXISTS hybrids_primary_use TEXT,
ADD COLUMN IF NOT EXISTS hybrids_distance_gap TEXT,
ADD COLUMN IF NOT EXISTS hybrids_ball_flight TEXT,
ADD COLUMN IF NOT EXISTS hybrids_trajectory_pref TEXT,
ADD COLUMN IF NOT EXISTS hybrids_forgiveness_priority TEXT;

-- Wedge fields (for future implementation)
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS wedges_current_setup JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS wedges_spin_preference TEXT,
ADD COLUMN IF NOT EXISTS wedges_greenside_feel_pref TEXT,
ADD COLUMN IF NOT EXISTS wedges_bunker_play_quality TEXT,
ADD COLUMN IF NOT EXISTS wedges_bounce_pref TEXT,
ADD COLUMN IF NOT EXISTS wedges_grind_pref TEXT,
ADD COLUMN IF NOT EXISTS wedges_shot_versatility_importance TEXT;