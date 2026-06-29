-- Enable RLS on all tables
ALTER TABLE swing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_swing_subscriptions ENABLE ROW LEVEL SECURITY;

-- swing_sessions policies
DROP POLICY IF EXISTS "Users can view own swing sessions" ON swing_sessions;
CREATE POLICY "Users can view own swing sessions" ON swing_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own swing sessions" ON swing_sessions;
CREATE POLICY "Users can insert own swing sessions" ON swing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own swing sessions" ON swing_sessions;
CREATE POLICY "Users can update own swing sessions" ON swing_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own swing sessions" ON swing_sessions;
CREATE POLICY "Users can delete own swing sessions" ON swing_sessions FOR DELETE USING (auth.uid() = user_id);

-- swing_metrics policies
DROP POLICY IF EXISTS "Users can view own swing metrics" ON swing_metrics;
CREATE POLICY "Users can view own swing metrics" ON swing_metrics FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own swing metrics" ON swing_metrics;
CREATE POLICY "Users can insert own swing metrics" ON swing_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own swing metrics" ON swing_metrics;
CREATE POLICY "Users can update own swing metrics" ON swing_metrics FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own swing metrics" ON swing_metrics;
CREATE POLICY "Users can delete own swing metrics" ON swing_metrics FOR DELETE USING (auth.uid() = user_id);

-- swing_goals policies
DROP POLICY IF EXISTS "Users can view own goals" ON swing_goals;
CREATE POLICY "Users can view own goals" ON swing_goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own goals" ON swing_goals;
CREATE POLICY "Users can insert own goals" ON swing_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON swing_goals;
CREATE POLICY "Users can update own goals" ON swing_goals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON swing_goals;
CREATE POLICY "Users can delete own goals" ON swing_goals FOR DELETE USING (auth.uid() = user_id);

-- achievement_badges policies
DROP POLICY IF EXISTS "Users can view own badges" ON achievement_badges;
CREATE POLICY "Users can view own badges" ON achievement_badges FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert badges" ON achievement_badges;
CREATE POLICY "System can insert badges" ON achievement_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_swing_subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscription" ON user_swing_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_swing_subscriptions FOR SELECT USING (auth.uid() = user_id);