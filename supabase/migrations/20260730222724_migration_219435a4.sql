-- Add archived column to profiles table (no new policies needed - existing admin policies cover it)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Create index for faster queries filtering archived users
CREATE INDEX IF NOT EXISTS idx_profiles_archived ON profiles(archived);