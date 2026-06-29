-- Swing DNA Analytics & Progress Tracking - Database Schema
-- Phase 1: Core Tables, RLS, and Functions

-- TABLE 1: swing_sessions
CREATE TABLE IF NOT EXISTS swing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_name TEXT,
  location TEXT,
  device_type TEXT CHECK (device_type IN ('golf_daddy', 'trackman', 'flightscope', 'garmin', 'manual', 'other')),
  total_shots INTEGER DEFAULT 0,
  avg_ball_speed NUMERIC(5,2),
  avg_club_speed NUMERIC(5,2),
  avg_carry_distance NUMERIC(6,2),
  avg_total_distance NUMERIC(6,2),
  avg_launch_angle NUMERIC(4,2),
  avg_spin_rate INTEGER,
  consistency_score NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swing_sessions_user_date ON swing_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_swing_sessions_user_id ON swing_sessions(user_id);

-- TABLE 2: swing_metrics
CREATE TABLE IF NOT EXISTS swing_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES swing_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shot_number INTEGER NOT NULL,
  club_used TEXT,
  ball_speed NUMERIC(5,2),
  carry_distance NUMERIC(6,2),
  total_distance NUMERIC(6,2),
  launch_angle NUMERIC(4,2),
  launch_direction NUMERIC(5,2),
  spin_rate INTEGER,
  spin_axis NUMERIC(5,2),
  max_height NUMERIC(5,2),
  landing_angle NUMERIC(4,2),
  club_speed NUMERIC(5,2),
  club_path NUMERIC(5,2),
  face_angle NUMERIC(5,2),
  attack_angle NUMERIC(5,2),
  dynamic_loft NUMERIC(4,2),
  smash_factor NUMERIC(3,2),
  shot_type TEXT CHECK (shot_type IN ('straight', 'draw', 'fade', 'hook', 'slice', 'pull', 'push')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swing_metrics_session ON swing_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_swing_metrics_user_date ON swing_metrics(user_id, created_at DESC);

-- TABLE 3: swing_goals
CREATE TABLE IF NOT EXISTS swing_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  metric_name TEXT NOT NULL CHECK (metric_name IN (
    'ball_speed', 'club_speed', 'carry_distance', 'total_distance',
    'launch_angle', 'spin_rate', 'consistency_score', 'smash_factor'
  )),
  target_value NUMERIC(8,2) NOT NULL,
  current_value NUMERIC(8,2),
  start_value NUMERIC(8,2),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  completed_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  progress_percent NUMERIC(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swing_goals_user_status ON swing_goals(user_id, status);

-- TABLE 4: achievement_badges
CREATE TABLE IF NOT EXISTS achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  badge_icon TEXT,
  earned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_value NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

CREATE INDEX IF NOT EXISTS idx_achievement_badges_user ON achievement_badges(user_id, earned_date DESC);

-- TABLE 5: user_swing_subscriptions
CREATE TABLE IF NOT EXISTS user_swing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'none' CHECK (tier IN ('none', 'core_addon', 'premium', 'premium_plus')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  data_retention_months INTEGER,
  max_sessions_per_month INTEGER,
  stripe_subscription_id TEXT,
  last_payment_date DATE,
  next_payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_swing_subscriptions_active ON user_swing_subscriptions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_swing_subscriptions_user ON user_swing_subscriptions(user_id);