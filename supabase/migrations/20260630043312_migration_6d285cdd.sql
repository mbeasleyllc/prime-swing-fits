-- Add missing cancel_at_period_end column to user_swing_subscriptions
ALTER TABLE user_swing_subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_swing_subscriptions.cancel_at_period_end IS 'Whether the subscription will cancel at the end of the current period';