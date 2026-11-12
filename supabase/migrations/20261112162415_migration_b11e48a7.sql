-- Add remaining fairway woods, hybrids, and wedges fields

-- Fairway Woods fields
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS current_fairway_woods JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS fairway_woods_make TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_model TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_usage JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS fairway_woods_distance_satisfaction TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_accuracy_satisfaction TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_yardage_gap_3w INTEGER,
ADD COLUMN IF NOT EXISTS fairway_woods_yardage_gap_5w INTEGER,
ADD COLUMN IF NOT EXISTS fairway_woods_shot_shape TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_trajectory TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_airborne_difficulty TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_head_size_pref TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_shaft_feel_pref TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_primary_goal TEXT,
ADD COLUMN IF NOT EXISTS fairway_woods_additional_notes TEXT;

-- Hybrids fields
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS current_hybrids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hybrids_replace_long_irons BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hybrids_make TEXT,
ADD COLUMN IF NOT EXISTS hybrids_model TEXT,
ADD COLUMN IF NOT EXISTS hybrids_distance_gaps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hybrids_primary_usage JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hybrids_distance_satisfaction TEXT,
ADD COLUMN IF NOT EXISTS hybrids_accuracy_satisfaction TEXT,
ADD COLUMN IF NOT EXISTS hybrids_ball_flight TEXT,
ADD COLUMN IF NOT EXISTS hybrids_trajectory TEXT,
ADD COLUMN IF NOT EXISTS hybrids_vs_fairway_woods TEXT,
ADD COLUMN IF NOT EXISTS hybrids_launch_difficulty TEXT,
ADD COLUMN IF NOT EXISTS hybrids_head_style_pref TEXT,
ADD COLUMN IF NOT EXISTS hybrids_primary_goal TEXT,
ADD COLUMN IF NOT EXISTS hybrids_additional_notes TEXT;

-- Wedges fields
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS current_wedges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS wedges_make TEXT,
ADD COLUMN IF NOT EXISTS wedges_model TEXT,
ADD COLUMN IF NOT EXISTS wedges_loft_gaps TEXT,
ADD COLUMN IF NOT EXISTS wedges_spin_performance TEXT,
ADD COLUMN IF NOT EXISTS wedges_greenside_feel TEXT,
ADD COLUMN IF NOT EXISTS wedges_bunker_performance TEXT,
ADD COLUMN IF NOT EXISTS wedges_shot_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS wedges_distance_control TEXT,
ADD COLUMN IF NOT EXISTS wedges_primary_goal TEXT,
ADD COLUMN IF NOT EXISTS wedges_additional_notes TEXT;

-- Add comments
COMMENT ON COLUMN fitting_sessions.current_fairway_woods IS 'Array of fairway woods user currently has';
COMMENT ON COLUMN fitting_sessions.current_hybrids IS 'Array of hybrids user currently has';
COMMENT ON COLUMN fitting_sessions.current_wedges IS 'Array of wedges user currently has';