-- Swing DNA Analytics & Progress Tracking - Database Schema
-- Phase 1: Core Tables, RLS, and Functions

-- ============================================================================
-- TABLE 1: swing_sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS swing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session metadata
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_name TEXT,
  location TEXT,
  device_type TEXT CHECK (device_type IN ('golf_daddy', 'trackman', 'flightscope', 'garmin', 'manual', 'other')),
  
  -- Session summary stats (calculated from metrics)
  total_shots INTEGER DEFAULT 0,
  avg_ball_speed NUMERIC(5,2),
  avg_club_speed NUMERIC(5,2),
  avg_carry_distance NUMERIC(6,2),
  avg_total_distance NUMERIC(6,2),
  avg_launch_angle NUMERIC(4,2),
  avg_spin_rate INTEGER,
  consistency_score NUMERIC(5,2), -- 0-100 calculated score
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_swing_sessions_user_date ON swing_sessions(user_id, session_date DESC);
CREATE INDEX idx_swing_sessions_user_id ON swing_sessions(user_id);

-- ============================================================================
-- TABLE 2: swing_metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS swing_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES swing_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Shot metadata
  shot_number INTEGER NOT NULL,
  club_used TEXT, -- e.g., "Driver", "7 Iron", "PW"
  
  -- Ball metrics
  ball_speed NUMERIC(5,2), -- mph
  carry_distance NUMERIC(6,2), -- yards
  total_distance NUMERIC(6,2), -- yards
  launch_angle NUMERIC(4,2), -- degrees
  launch_direction NUMERIC(5,2), -- degrees (+ = right, - = left)
  spin_rate INTEGER, -- rpm
  spin_axis NUMERIC(5,2), -- degrees
  max_height NUMERIC(5,2), -- yards
  landing_angle NUMERIC(4,2), -- degrees
  
  -- Club metrics
  club_speed NUMERIC(5,2), -- mph
  club_path NUMERIC(5,2), -- degrees (+ = in-to-out, - = out-to-in)
  face_angle NUMERIC(5,2), -- degrees (+ = open, - = closed)
  attack_angle NUMERIC(5,2), -- degrees (+ = up, - = down)
  dynamic_loft NUMERIC(4,2), -- degrees
  smash_factor NUMERIC(3,2), -- ratio
  
  -- Shot quality
  shot_type TEXT CHECK (shot_type IN ('straight', 'draw', 'fade', 'hook', 'slice', 'pull', 'push')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_swing_metrics_session ON swing_metrics(session_id);
CREATE INDEX idx_swing_metrics_user_date ON swing_metrics(user_id, created_at DESC);

-- ============================================================================
-- TABLE 3: swing_goals
-- ============================================================================
CREATE TABLE IF NOT EXISTS swing_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal definition
  goal_name TEXT NOT NULL,
  metric_name TEXT NOT NULL CHECK (metric_name IN (
    'ball_speed', 'club_speed', 'carry_distance', 'total_distance',
    'launch_angle', 'spin_rate', 'consistency_score', 'smash_factor'
  )),
  target_value NUMERIC(8,2) NOT NULL,
  current_value NUMERIC(8,2),
  start_value NUMERIC(8,2),
  
  -- Goal timeline
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  completed_date DATE,
  
  -- Progress tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  progress_percent NUMERIC(5,2) DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_swing_goals_user_status ON swing_goals(user_id, status);

-- ============================================================================
-- TABLE 4: achievement_badges
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Badge details
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    'first_session', 'consistency_bronze', 'consistency_silver', 'consistency_gold',
    'speed_demon_80', 'speed_demon_90', 'speed_demon_100', 'speed_demon_110',
    'distance_200', 'distance_225', 'distance_250', 'distance_275', 'distance_300',
    'goal_achiever_1', 'goal_achiever_5', 'goal_achiever_10',
    'streak_7', 'streak_30', 'streak_90',
    'data_collector_10', 'data_collector_50', 'data_collector_100'
  )),
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT, -- emoji or icon class
  
  -- Achievement data
  earned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_value NUMERIC(8,2), -- The value that triggered the badge
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate badges
  UNIQUE(user_id, badge_type)
);

-- Indexes
CREATE INDEX idx_achievement_badges_user ON achievement_badges(user_id, earned_date DESC);

-- ============================================================================
-- TABLE 5: user_swing_subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_swing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription tier (matches pricing)
  tier TEXT NOT NULL DEFAULT 'none' CHECK (tier IN ('none', 'core_addon', 'premium', 'premium_plus')),
  
  -- Subscription period
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  
  -- Tier limits (enforced in RLS and app logic)
  data_retention_months INTEGER, -- 3 for core_addon, 12 for premium, unlimited (-1) for premium_plus
  max_sessions_per_month INTEGER, -- NULL = unlimited
  
  -- Payment tracking
  stripe_subscription_id TEXT,
  last_payment_date DATE,
  next_payment_date DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Only one active subscription per user
  UNIQUE(user_id, is_active) WHERE is_active = true
);

-- Indexes
CREATE INDEX idx_user_swing_subscriptions_user ON user_swing_subscriptions(user_id);
CREATE INDEX idx_user_swing_subscriptions_active ON user_swing_subscriptions(user_id, is_active);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE swing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_swing_subscriptions ENABLE ROW LEVEL SECURITY;

-- swing_sessions policies
CREATE POLICY "Users can view own swing sessions"
  ON swing_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swing sessions"
  ON swing_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own swing sessions"
  ON swing_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own swing sessions"
  ON swing_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all swing sessions"
  ON swing_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- swing_metrics policies
CREATE POLICY "Users can view own swing metrics"
  ON swing_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swing metrics"
  ON swing_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own swing metrics"
  ON swing_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own swing metrics"
  ON swing_metrics FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all swing metrics"
  ON swing_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- swing_goals policies
CREATE POLICY "Users can view own goals"
  ON swing_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON swing_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON swing_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON swing_goals FOR DELETE
  USING (auth.uid() = user_id);

-- achievement_badges policies
CREATE POLICY "Users can view own badges"
  ON achievement_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
  ON achievement_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- user_swing_subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON user_swing_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions"
  ON user_swing_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function: Calculate consistency score (0-100)
-- Based on coefficient of variation (CV) of key metrics
CREATE OR REPLACE FUNCTION calculate_consistency_score(p_session_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_ball_speed_cv NUMERIC;
  v_carry_distance_cv NUMERIC;
  v_launch_angle_cv NUMERIC;
  v_consistency_score NUMERIC;
BEGIN
  -- Calculate coefficient of variation for ball speed
  SELECT 
    CASE 
      WHEN AVG(ball_speed) = 0 THEN 100
      ELSE (STDDEV(ball_speed) / NULLIF(AVG(ball_speed), 0)) * 100
    END
  INTO v_ball_speed_cv
  FROM swing_metrics
  WHERE session_id = p_session_id AND ball_speed IS NOT NULL;
  
  -- Calculate coefficient of variation for carry distance
  SELECT 
    CASE 
      WHEN AVG(carry_distance) = 0 THEN 100
      ELSE (STDDEV(carry_distance) / NULLIF(AVG(carry_distance), 0)) * 100
    END
  INTO v_carry_distance_cv
  FROM swing_metrics
  WHERE session_id = p_session_id AND carry_distance IS NOT NULL;
  
  -- Calculate coefficient of variation for launch angle
  SELECT 
    CASE 
      WHEN AVG(launch_angle) = 0 THEN 100
      ELSE (STDDEV(launch_angle) / NULLIF(AVG(launch_angle), 0)) * 100
    END
  INTO v_launch_angle_cv
  FROM swing_metrics
  WHERE session_id = p_session_id AND launch_angle IS NOT NULL;
  
  -- Consistency score: 100 - average CV (lower CV = higher consistency)
  v_consistency_score := 100 - COALESCE((v_ball_speed_cv + v_carry_distance_cv + v_launch_angle_cv) / 3, 0);
  
  -- Clamp between 0 and 100
  v_consistency_score := GREATEST(0, LEAST(100, v_consistency_score));
  
  RETURN v_consistency_score;
END;
$$ LANGUAGE plpgsql;

-- Function: Get improvement trend (linear regression)
-- Returns slope (positive = improving, negative = declining)
CREATE OR REPLACE FUNCTION get_improvement_trend(
  p_user_id UUID,
  p_metric_name TEXT,
  p_days_back INTEGER DEFAULT 90
)
RETURNS NUMERIC AS $$
DECLARE
  v_slope NUMERIC;
BEGIN
  WITH session_data AS (
    SELECT 
      session_date,
      EXTRACT(EPOCH FROM session_date - MIN(session_date) OVER ()) / 86400 AS day_number,
      CASE p_metric_name
        WHEN 'ball_speed' THEN avg_ball_speed
        WHEN 'club_speed' THEN avg_club_speed
        WHEN 'carry_distance' THEN avg_carry_distance
        WHEN 'total_distance' THEN avg_total_distance
        WHEN 'consistency_score' THEN consistency_score
        ELSE NULL
      END AS metric_value
    FROM swing_sessions
    WHERE user_id = p_user_id
      AND session_date >= CURRENT_DATE - p_days_back
      AND CASE p_metric_name
        WHEN 'ball_speed' THEN avg_ball_speed
        WHEN 'club_speed' THEN avg_club_speed
        WHEN 'carry_distance' THEN avg_carry_distance
        WHEN 'total_distance' THEN avg_total_distance
        WHEN 'consistency_score' THEN consistency_score
        ELSE NULL
      END IS NOT NULL
  ),
  regression AS (
    SELECT
      COUNT(*) AS n,
      SUM(day_number) AS sum_x,
      SUM(metric_value) AS sum_y,
      SUM(day_number * metric_value) AS sum_xy,
      SUM(day_number * day_number) AS sum_xx
    FROM session_data
  )
  SELECT 
    CASE 
      WHEN n < 2 THEN 0
      ELSE (n * sum_xy - sum_x * sum_y) / NULLIF(n * sum_xx - sum_x * sum_x, 0)
    END
  INTO v_slope
  FROM regression;
  
  RETURN COALESCE(v_slope, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Check and award badges (trigger function)
CREATE OR REPLACE FUNCTION check_badge_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  v_total_sessions INTEGER;
  v_avg_consistency NUMERIC;
  v_max_club_speed NUMERIC;
  v_max_carry NUMERIC;
  v_completed_goals INTEGER;
BEGIN
  -- First session badge
  SELECT COUNT(*) INTO v_total_sessions
  FROM swing_sessions WHERE user_id = NEW.user_id;
  
  IF v_total_sessions = 1 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (NEW.user_id, 'first_session', 'Getting Started', 'Recorded your first swing session', '🎯')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Data collector badges
  IF v_total_sessions = 10 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'data_collector_10', 'Data Enthusiast', '10 swing sessions recorded', '📊', 10)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_total_sessions = 50 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'data_collector_50', 'Data Master', '50 swing sessions recorded', '📈', 50)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_total_sessions = 100 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'data_collector_100', 'Data Legend', '100 swing sessions recorded', '🏆', 100)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Consistency badges (average across last 10 sessions)
  SELECT AVG(consistency_score) INTO v_avg_consistency
  FROM (
    SELECT consistency_score
    FROM swing_sessions
    WHERE user_id = NEW.user_id AND consistency_score IS NOT NULL
    ORDER BY session_date DESC
    LIMIT 10
  ) recent_sessions;
  
  IF v_avg_consistency >= 90 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'consistency_gold', 'Gold Consistency', '90+ consistency score', '🥇', v_avg_consistency)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_consistency >= 80 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'consistency_silver', 'Silver Consistency', '80+ consistency score', '🥈', v_avg_consistency)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_consistency >= 70 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'consistency_bronze', 'Bronze Consistency', '70+ consistency score', '🥉', v_avg_consistency)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Speed badges
  SELECT MAX(avg_club_speed) INTO v_max_club_speed
  FROM swing_sessions WHERE user_id = NEW.user_id;
  
  IF v_max_club_speed >= 110 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'speed_demon_110', 'Speed Demon 110', 'Club speed 110+ mph', '⚡', v_max_club_speed)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_max_club_speed >= 100 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'speed_demon_100', 'Speed Demon 100', 'Club speed 100+ mph', '⚡', v_max_club_speed)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_max_club_speed >= 90 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'speed_demon_90', 'Speed Demon 90', 'Club speed 90+ mph', '⚡', v_max_club_speed)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_max_club_speed >= 80 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'speed_demon_80', 'Speed Demon 80', 'Club speed 80+ mph', '⚡', v_max_club_speed)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Distance badges
  SELECT MAX(avg_carry_distance) INTO v_max_carry
  FROM swing_sessions WHERE user_id = NEW.user_id;
  
  IF v_max_carry >= 300 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'distance_300', '300 Club', 'Carry distance 300+ yards', '🚀', v_max_carry)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_max_carry >= 275 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'distance_275', '275 Club', 'Carry distance 275+ yards', '🚀', v_max_carry)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_max_carry >= 250 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'distance_250', '250 Club', 'Carry distance 250+ yards', '🚀', v_max_carry)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_max_carry >= 225 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'distance_225', '225 Club', 'Carry distance 225+ yards', '🚀', v_max_carry)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_max_carry >= 200 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'distance_200', '200 Club', 'Carry distance 200+ yards', '🚀', v_max_carry)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Goal achiever badges
  SELECT COUNT(*) INTO v_completed_goals
  FROM swing_goals WHERE user_id = NEW.user_id AND status = 'completed';
  
  IF v_completed_goals >= 10 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'goal_achiever_10', 'Goal Master', '10 goals achieved', '🎯', 10)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_completed_goals >= 5 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'goal_achiever_5', 'Goal Crusher', '5 goals achieved', '🎯', 5)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_completed_goals >= 1 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'goal_achiever_1', 'Goal Getter', 'First goal achieved', '🎯', 1)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for badge checking
CREATE TRIGGER check_badges_after_session
  AFTER INSERT OR UPDATE ON swing_sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_badge_eligibility();

-- ============================================================================
-- HELPER FUNCTION: Update session summary stats
-- ============================================================================
CREATE OR REPLACE FUNCTION update_session_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate session summary whenever metrics are added/updated
  UPDATE swing_sessions
  SET 
    total_shots = (SELECT COUNT(*) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_ball_speed = (SELECT AVG(ball_speed) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_club_speed = (SELECT AVG(club_speed) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_carry_distance = (SELECT AVG(carry_distance) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_total_distance = (SELECT AVG(total_distance) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_launch_angle = (SELECT AVG(launch_angle) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_spin_rate = (SELECT AVG(spin_rate)::INTEGER FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    consistency_score = calculate_consistency_score(COALESCE(NEW.session_id, OLD.session_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update session stats
CREATE TRIGGER update_session_stats_after_metric_change
  AFTER INSERT OR UPDATE OR DELETE ON swing_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_session_summary();

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- Migration complete. All tables, RLS policies, and functions created.