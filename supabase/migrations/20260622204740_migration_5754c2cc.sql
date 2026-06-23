-- Drop the recursive policies on users table
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert" ON users;

-- Create simple non-recursive policies
CREATE POLICY "select_own" ON users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "update_own" ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "insert_own" ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());