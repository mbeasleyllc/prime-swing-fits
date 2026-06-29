-- Add performance indexes for swing analytics queries
-- These indexes significantly improve query performance for user dashboards

-- Index for user's swing data queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_swing_data_user_date 
ON swing_data(user_id, session_date DESC);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_swing_data_session_id 
ON swing_data(session_id);

-- Index for user's goals queries
CREATE INDEX IF NOT EXISTS idx_swing_goals_user_status 
ON swing_goals(user_id, status);

-- Index for user's badges queries
CREATE INDEX IF NOT EXISTS idx_user_badges_user_earned 
ON user_badges(user_id, earned_at DESC);

-- Index for subscription queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
ON subscriptions(user_id, status);

-- Composite index for dashboard aggregations
CREATE INDEX IF NOT EXISTS idx_swing_data_user_date_club 
ON swing_data(user_id, session_date, club_type);

-- Index for metric-based filtering (distance analysis)
CREATE INDEX IF NOT EXISTS idx_swing_data_carry_distance 
ON swing_data(carry_distance) WHERE carry_distance IS NOT NULL;

-- Index for recent sessions query
CREATE INDEX IF NOT EXISTS idx_swing_data_created_at 
ON swing_data(created_at DESC);

-- Add statistics for better query planning
ANALYZE swing_data;
ANALYZE swing_goals;
ANALYZE user_badges;
ANALYZE subscriptions;