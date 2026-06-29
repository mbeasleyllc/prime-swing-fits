-- Add performance indexes for swing analytics queries
-- These indexes significantly improve query performance for user dashboards

-- Index for user's swing sessions queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_swing_sessions_user_date 
ON swing_sessions(user_id, session_date DESC);

-- Index for user's swing metrics queries
CREATE INDEX IF NOT EXISTS idx_swing_metrics_user_date 
ON swing_metrics(user_id, created_at DESC);

-- Index for session metrics lookups
CREATE INDEX IF NOT EXISTS idx_swing_metrics_session 
ON swing_metrics(session_id);

-- Index for user's goals queries
CREATE INDEX IF NOT EXISTS idx_swing_goals_user_status 
ON swing_goals(user_id, status);

-- Index for user's badges queries
CREATE INDEX IF NOT EXISTS idx_achievement_badges_user 
ON achievement_badges(user_id, earned_at DESC);

-- Index for subscription queries
CREATE INDEX IF NOT EXISTS idx_user_swing_subscriptions_user 
ON user_swing_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_swing_subscriptions_active 
ON user_swing_subscriptions(user_id, is_active);

-- Add statistics for better query planning
ANALYZE swing_sessions;
ANALYZE swing_metrics;
ANALYZE swing_goals;
ANALYZE achievement_badges;
ANALYZE user_swing_subscriptions;