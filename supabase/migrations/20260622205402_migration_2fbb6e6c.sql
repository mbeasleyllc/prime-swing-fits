-- Drop all recursive policies on fitting_sessions
DROP POLICY IF EXISTS "sessions_select" ON fitting_sessions;
DROP POLICY IF EXISTS "sessions_update" ON fitting_sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON fitting_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON fitting_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON fitting_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON fitting_sessions;

-- Create simple non-recursive policies
CREATE POLICY "select_own" ON fitting_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "insert_own" ON fitting_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own" ON fitting_sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete_own" ON fitting_sessions
  FOR DELETE
  USING (user_id = auth.uid());