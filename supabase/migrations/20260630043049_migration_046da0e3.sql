-- Add role column to profiles table for admin access control
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Add subscription_tier column to user_profiles for club fitting tier tracking
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('entry', 'core', 'premium', 'premium_plus'));

-- Add status and plan_id columns to user_swing_subscriptions if they don't exist
ALTER TABLE user_swing_subscriptions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due'));
ALTER TABLE user_swing_subscriptions ADD COLUMN IF NOT EXISTS plan_id TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.role IS 'User role: user (standard) or admin (full access)';
COMMENT ON COLUMN user_profiles.subscription_tier IS 'Club fitting subscription tier: entry, core, premium, premium_plus';
COMMENT ON COLUMN user_swing_subscriptions.status IS 'Subscription status: active, canceled, past_due';
COMMENT ON COLUMN user_swing_subscriptions.plan_id IS 'Stripe price ID for the subscription plan';