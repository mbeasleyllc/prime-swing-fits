-- Migration: Club Category Selection Support
-- Purpose: Add fields to support selective club category fitting

-- Add columns to fitting_sessions table
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS selected_categories JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free_trial',
ADD COLUMN IF NOT EXISTS clubs_fitted_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS uses_category_selection BOOLEAN DEFAULT false;

-- Add step_0_data column for club category selection step
ALTER TABLE fitting_sessions
ADD COLUMN IF NOT EXISTS step_0_data JSONB;

-- Create index for category queries
CREATE INDEX IF NOT EXISTS idx_fitting_sessions_categories ON fitting_sessions USING gin(selected_categories);

-- Add check constraint for valid subscription tiers
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
ADD CONSTRAINT valid_category 
CHECK (category IN ('driver', 'fairway_woods', 'hybrids', 'irons', 'wedges', 'putter', 'golf_ball'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recommendations_v2_session ON fitting_recommendations_v2(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_v2_user ON fitting_recommendations_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_v2_category ON fitting_recommendations_v2(category);

-- Enable RLS on new table
ALTER TABLE fitting_recommendations_v2 ENABLE ROW LEVEL SECURITY;

-- RLS policies for fitting_recommendations_v2
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

-- Create updated_at trigger for fitting_recommendations_v2
CREATE OR REPLACE FUNCTION update_fitting_recommendations_v2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_fitting_recommendations_v2_updated_at
  BEFORE UPDATE ON fitting_recommendations_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_fitting_recommendations_v2_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN fitting_sessions.selected_categories IS 'JSONB array of club categories user wants fitted: driver, fairway_woods, hybrids, irons, wedges, putter, golf_ball';
COMMENT ON COLUMN fitting_sessions.subscription_tier IS 'User subscription tier: free_trial, single_club_starter, full_bag_premium, full_bag_executive';
COMMENT ON COLUMN fitting_sessions.clubs_fitted_count IS 'Number of clubs fitted in this session, used for single_club_starter tier limit';
COMMENT ON COLUMN fitting_sessions.uses_category_selection IS 'True if session uses new category selection workflow, false for legacy sessions';
COMMENT ON TABLE fitting_recommendations_v2 IS 'Category-specific fitting recommendations with confidence scores';