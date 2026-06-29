-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_badge_view timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'entry' CHECK (subscription_tier IN ('entry', 'core', 'premium'));

-- Add missing column to swing_goals
ALTER TABLE swing_goals
ADD COLUMN IF NOT EXISTS last_reminder_sent timestamp with time zone;

-- Create swing_insights table
CREATE TABLE IF NOT EXISTS swing_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('performance', 'consistency', 'equipment', 'goal')),
  title text NOT NULL,
  description text NOT NULL,
  recommendation text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamp with time zone DEFAULT now(),
  dismissed_at timestamp with time zone
);

-- RLS for swing_insights
ALTER TABLE swing_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON swing_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON swing_insights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights" ON swing_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_swing_insights_user ON swing_insights(user_id, created_at DESC);