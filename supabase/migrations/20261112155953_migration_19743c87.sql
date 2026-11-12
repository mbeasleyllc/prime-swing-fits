-- Apply the migration to add new columns for category-based fitting
-- This will resolve the TypeScript errors

-- Add columns to fitting_sessions table
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS selected_categories JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free_trial',
ADD COLUMN IF NOT EXISTS clubs_fitted_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS uses_category_selection BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS step_0_data JSONB,
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS handicap_goal NUMERIC,
ADD COLUMN IF NOT EXISTS ball_striking_quality TEXT,
ADD COLUMN IF NOT EXISTS has_clubs BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS clubs_age TEXT,
ADD COLUMN IF NOT EXISTS replacement_scope TEXT,
ADD COLUMN IF NOT EXISTS current_driver_loft NUMERIC,
ADD COLUMN IF NOT EXISTS current_driver_flex TEXT,
ADD COLUMN IF NOT EXISTS current_driver_length NUMERIC,
ADD COLUMN IF NOT EXISTS current_driver_make TEXT,
ADD COLUMN IF NOT EXISTS current_driver_model TEXT,
ADD COLUMN IF NOT EXISTS driver_distance_satisfaction TEXT,
ADD COLUMN IF NOT EXISTS driver_accuracy_satisfaction TEXT,
ADD COLUMN IF NOT EXISTS driver_ball_flight TEXT,
ADD COLUMN IF NOT EXISTS driver_trajectory TEXT,
ADD COLUMN IF NOT EXISTS driver_miss_pattern JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS driver_swing_speed TEXT,
ADD COLUMN IF NOT EXISTS driver_tempo TEXT,
ADD COLUMN IF NOT EXISTS driver_performance_goals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS driver_head_size_pref TEXT,
ADD COLUMN IF NOT EXISTS driver_sound_pref TEXT,
ADD COLUMN IF NOT EXISTS driver_adjustability_importance TEXT;

-- Create index for category queries
CREATE INDEX IF NOT EXISTS idx_fitting_sessions_categories ON fitting_sessions USING gin(selected_categories);

-- Add check constraint for valid subscription tiers
ALTER TABLE fitting_sessions
DROP CONSTRAINT IF EXISTS valid_subscription_tier;

ALTER TABLE fitting_sessions
ADD CONSTRAINT valid_subscription_tier 
CHECK (subscription_tier IN ('free_trial', 'single_club_starter', 'full_bag_premium', 'full_bag_executive'));

-- Create new table for category-specific recommendations
CREATE TABLE IF NOT EXISTS fitting_recommendations_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES fitting_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add constraint for valid categories
ALTER TABLE fitting_recommendations_v2
DROP CONSTRAINT IF EXISTS valid_category;

ALTER TABLE fitting_recommendations_v2
ADD CONSTRAINT valid_category 
CHECK (category IN ('driver', 'fairway_woods', 'hybrids', 'irons', 'wedges', 'putter', 'golf_ball'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recommendations_v2_session ON fitting_recommendations_v2(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_v2_user ON fitting_recommendations_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_v2_category ON fitting_recommendations_v2(category);

-- Enable RLS on new table
ALTER TABLE fitting_recommendations_v2 ENABLE ROW LEVEL SECURITY;

-- RLS policies for fitting_recommendations_v2
DROP POLICY IF EXISTS "Users can view own recommendations" ON fitting_recommendations_v2;
DROP POLICY IF EXISTS "Users can insert own recommendations" ON fitting_recommendations_v2;
DROP POLICY IF EXISTS "Users can update own recommendations" ON fitting_recommendations_v2;
DROP POLICY IF EXISTS "Users can delete own recommendations" ON fitting_recommendations_v2;

CREATE POLICY "Users can view own recommendations"
  ON fitting_recommendations_v2
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON fitting_recommendations_v2
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON fitting_recommendations_v2
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON fitting_recommendations_v2
  FOR DELETE
  USING (auth.uid() = user_id);