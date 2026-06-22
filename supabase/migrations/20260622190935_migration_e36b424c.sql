-- TABLE 1: users (extends auth.users with app-specific fields)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE 2: fitting_sessions
CREATE TABLE fitting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  current_step int DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 6),
  flagged boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- TABLE 3: player_profile
CREATE TABLE player_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES fitting_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  full_name text,
  age int CHECK (age >= 10 AND age <= 99),
  dominant_hand text CHECK (dominant_hand IN ('right', 'left')),
  experience text CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  handicap text CHECK (handicap IN ('none', '0-5', '6-15', '16-25', '26+')),
  primary_goal text CHECK (primary_goal IN ('distance', 'accuracy', 'consistency', 'all_around'))
);

-- TABLE 4: swing_profile
CREATE TABLE swing_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES fitting_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  typical_shot text CHECK (typical_shot IN ('straight', 'fade', 'draw', 'slice', 'hook')),
  miss_tendency text CHECK (miss_tendency IN ('left', 'right', 'long', 'short')),
  ball_flight text CHECK (ball_flight IN ('high', 'mid', 'low')),
  swing_tempo text CHECK (swing_tempo IN ('slow', 'moderate', 'fast')),
  swing_strength text CHECK (swing_strength IN ('light', 'moderate', 'strong'))
);

-- TABLE 5: course_conditions
CREATE TABLE course_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES fitting_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  turf_type text CHECK (turf_type IN ('soft', 'firm', 'mixed')),
  typical_weather text CHECK (typical_weather IN ('calm', 'windy', 'varied')),
  ball_used text CHECK (ball_used IN ('distance', 'control', 'premium', 'any'))
);

-- TABLE 6: physical_profile
CREATE TABLE physical_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES fitting_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  height_ft int CHECK (height_ft >= 4 AND height_ft <= 7),
  height_in int CHECK (height_in >= 0 AND height_in <= 11),
  wrist_to_floor decimal(4,1) CHECK (wrist_to_floor >= 25.0 AND wrist_to_floor <= 45.0),
  hand_size text CHECK (hand_size IN ('small', 'medium', 'large', 'extra_large')),
  injuries text[],
  mobility_limit text CHECK (mobility_limit IN ('none', 'mild', 'moderate', 'severe'))
);

-- TABLE 7: current_equipment
CREATE TABLE current_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES fitting_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  club_brand text,
  club_length text CHECK (club_length IN ('standard', 'longer', 'shorter', 'unknown')),
  shaft_flex text CHECK (shaft_flex IN ('L', 'A', 'R', 'S', 'X', 'unknown')),
  grip_size text CHECK (grip_size IN ('undersize', 'standard', 'midsize', 'oversize', 'unknown')),
  satisfaction int CHECK (satisfaction >= 1 AND satisfaction <= 5),
  pain_points text
);

-- TABLE 8: fitting_recommendations
CREATE TABLE fitting_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES fitting_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  club_length_adj text,
  lie_angle_adj text,
  grip_size_rec text CHECK (grip_size_rec IN ('undersize', 'standard', 'midsize', 'oversize')),
  shaft_flex_rec text CHECK (shaft_flex_rec IN ('L', 'A', 'R', 'S', 'X')),
  shaft_weight text,
  club_type_rec text,
  advisory_notes text,
  generated_at timestamp with time zone DEFAULT now()
);

-- TABLE 9: fitting_rules (static lookup - admin managed)
CREATE TABLE fitting_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  input_field text NOT NULL,
  input_value text NOT NULL,
  output_field text NOT NULL,
  output_value text NOT NULL,
  priority int DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE 10: products (static catalog - admin managed)
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text CHECK (category IN ('shaft', 'grip', 'iron_set', 'driver', 'wedge')),
  brand text,
  model_name text,
  flex_category text CHECK (flex_category IN ('L', 'A', 'R', 'S', 'X')),
  weight_grams int,
  grip_size text,
  price_usd decimal(8,2),
  affiliate_url text,
  image_url text,
  recommended_for text[]
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitting_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitting_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- users table: users can read and update their own row, admin can see all
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- fitting_sessions: user_id = auth.uid() OR admin
CREATE POLICY "sessions_select" ON fitting_sessions FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "sessions_insert" ON fitting_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sessions_update" ON fitting_sessions FOR UPDATE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "sessions_delete" ON fitting_sessions FOR DELETE USING (user_id = auth.uid());

-- player_profile: user_id = auth.uid() OR admin
CREATE POLICY "player_profile_select" ON player_profile FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "player_profile_insert" ON player_profile FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "player_profile_update" ON player_profile FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "player_profile_delete" ON player_profile FOR DELETE USING (user_id = auth.uid());

-- swing_profile: user_id = auth.uid() OR admin
CREATE POLICY "swing_profile_select" ON swing_profile FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "swing_profile_insert" ON swing_profile FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "swing_profile_update" ON swing_profile FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "swing_profile_delete" ON swing_profile FOR DELETE USING (user_id = auth.uid());

-- course_conditions: user_id = auth.uid() OR admin
CREATE POLICY "course_conditions_select" ON course_conditions FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "course_conditions_insert" ON course_conditions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "course_conditions_update" ON course_conditions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "course_conditions_delete" ON course_conditions FOR DELETE USING (user_id = auth.uid());

-- physical_profile: user_id = auth.uid() OR admin
CREATE POLICY "physical_profile_select" ON physical_profile FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "physical_profile_insert" ON physical_profile FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "physical_profile_update" ON physical_profile FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "physical_profile_delete" ON physical_profile FOR DELETE USING (user_id = auth.uid());

-- current_equipment: user_id = auth.uid() OR admin
CREATE POLICY "current_equipment_select" ON current_equipment FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "current_equipment_insert" ON current_equipment FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "current_equipment_update" ON current_equipment FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "current_equipment_delete" ON current_equipment FOR DELETE USING (user_id = auth.uid());

-- fitting_recommendations: user_id = auth.uid() OR admin
CREATE POLICY "recommendations_select" ON fitting_recommendations FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "recommendations_insert" ON fitting_recommendations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "recommendations_update" ON fitting_recommendations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "recommendations_delete" ON fitting_recommendations FOR DELETE USING (user_id = auth.uid());

-- fitting_rules: public read, admin write
CREATE POLICY "rules_select_public" ON fitting_rules FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rules_insert_admin" ON fitting_rules FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "rules_update_admin" ON fitting_rules FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "rules_delete_admin" ON fitting_rules FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- products: public read, admin write
CREATE POLICY "products_select_public" ON products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "products_insert_admin" ON products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "products_update_admin" ON products FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "products_delete_admin" ON products FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();