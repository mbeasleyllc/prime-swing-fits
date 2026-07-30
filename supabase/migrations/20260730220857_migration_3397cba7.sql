-- Add admin policies to user_profiles table for full admin access
-- Admins need to be able to manage all user profiles

-- Admin can SELECT all profiles
CREATE POLICY "Admins can view all profiles"
ON user_profiles
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can UPDATE all profiles
CREATE POLICY "Admins can update all profiles"
ON user_profiles
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can INSERT any profile
CREATE POLICY "Admins can insert any profile"
ON user_profiles
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can DELETE any profile
CREATE POLICY "Admins can delete any profile"
ON user_profiles
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);