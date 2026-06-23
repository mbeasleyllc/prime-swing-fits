-- Fix all remaining recursive policies on profile tables
-- player_profile
DROP POLICY IF EXISTS "player_profile_select" ON player_profile;
DROP POLICY IF EXISTS "player_profile_insert" ON player_profile;
DROP POLICY IF EXISTS "player_profile_update" ON player_profile;
DROP POLICY IF EXISTS "player_profile_delete" ON player_profile;

CREATE POLICY "select_own" ON player_profile FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON player_profile FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own" ON player_profile FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own" ON player_profile FOR DELETE USING (user_id = auth.uid());

-- swing_profile
DROP POLICY IF EXISTS "swing_profile_select" ON swing_profile;
DROP POLICY IF EXISTS "swing_profile_insert" ON swing_profile;
DROP POLICY IF EXISTS "swing_profile_update" ON swing_profile;
DROP POLICY IF EXISTS "swing_profile_delete" ON swing_profile;

CREATE POLICY "select_own" ON swing_profile FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON swing_profile FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own" ON swing_profile FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own" ON swing_profile FOR DELETE USING (user_id = auth.uid());

-- course_conditions
DROP POLICY IF EXISTS "course_conditions_select" ON course_conditions;
DROP POLICY IF EXISTS "course_conditions_insert" ON course_conditions;
DROP POLICY IF EXISTS "course_conditions_update" ON course_conditions;
DROP POLICY IF EXISTS "course_conditions_delete" ON course_conditions;

CREATE POLICY "select_own" ON course_conditions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON course_conditions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own" ON course_conditions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own" ON course_conditions FOR DELETE USING (user_id = auth.uid());

-- physical_profile
DROP POLICY IF EXISTS "physical_profile_select" ON physical_profile;
DROP POLICY IF EXISTS "physical_profile_insert" ON physical_profile;
DROP POLICY IF EXISTS "physical_profile_update" ON physical_profile;
DROP POLICY IF EXISTS "physical_profile_delete" ON physical_profile;

CREATE POLICY "select_own" ON physical_profile FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON physical_profile FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own" ON physical_profile FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own" ON physical_profile FOR DELETE USING (user_id = auth.uid());

-- current_equipment
DROP POLICY IF EXISTS "current_equipment_select" ON current_equipment;
DROP POLICY IF EXISTS "current_equipment_insert" ON current_equipment;
DROP POLICY IF EXISTS "current_equipment_update" ON current_equipment;
DROP POLICY IF EXISTS "current_equipment_delete" ON current_equipment;

CREATE POLICY "select_own" ON current_equipment FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON current_equipment FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own" ON current_equipment FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own" ON current_equipment FOR DELETE USING (user_id = auth.uid());

-- fitting_recommendations
DROP POLICY IF EXISTS "fitting_recommendations_select" ON fitting_recommendations;
DROP POLICY IF EXISTS "fitting_recommendations_insert" ON fitting_recommendations;
DROP POLICY IF EXISTS "fitting_recommendations_update" ON fitting_recommendations;
DROP POLICY IF EXISTS "fitting_recommendations_delete" ON fitting_recommendations;

CREATE POLICY "select_own" ON fitting_recommendations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON fitting_recommendations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own" ON fitting_recommendations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own" ON fitting_recommendations FOR DELETE USING (user_id = auth.uid());