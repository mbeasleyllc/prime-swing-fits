-- Add missing timestamp columns to user_swing_subscriptions
ALTER TABLE user_swing_subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

COMMENT ON COLUMN user_swing_subscriptions.current_period_start IS 'Start of the current billing period';
COMMENT ON COLUMN user_swing_subscriptions.current_period_end IS 'End of the current billing period';