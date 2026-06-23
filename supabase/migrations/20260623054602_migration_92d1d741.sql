-- Create user_profiles table for permanent profile storage
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name text,
  last_name text,
  phone_number text,
  city text,
  state text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  handicap_index numeric(4,1) CHECK (handicap_index >= 0 AND handicap_index <= 54),
  years_playing text CHECK (years_playing IN ('less_than_1', '1-3', '3-5', '5-10', '10_plus')),
  
  -- Measurements
  height_ft integer CHECK (height_ft >= 4 AND height_ft <= 7),
  height_in integer CHECK (height_in >= 0 AND height_in <= 11),
  wrist_to_floor numeric(4,1) CHECK (wrist_to_floor >= 27 AND wrist_to_floor <= 45),
  hand_size text CHECK (hand_size IN ('small', 'medium', 'large', 'xl')),
  dominant_hand text CHECK (dominant_hand IN ('right', 'left')),
  glove_size text CHECK (glove_size IN ('S', 'M', 'ML', 'L', 'XL')),
  
  -- Swing Profile
  swing_speed_range text CHECK (swing_speed_range IN ('under_70', '70-80', '80-90', '90-100', '100-110', '110_plus')),
  ball_flight text CHECK (ball_flight IN ('big_slice', 'soft_fade', 'straight', 'soft_draw', 'big_hook')),
  miss_direction text CHECK (miss_direction IN ('left', 'right', 'both', 'consistent')),
  attack_angle text CHECK (attack_angle IN ('steep', 'neutral', 'shallow')),
  club_path text CHECK (club_path IN ('inside_out', 'square', 'outside_in')),
  driver_distance text CHECK (driver_distance IN ('under_150', '150-175', '175-200', '200-225', '225-250', '250_plus')),
  iron_7_distance integer,
  preferred_ball_height text CHECK (preferred_ball_height IN ('low', 'medium', 'high')),
  
  -- Preferences & Goals
  primary_goals text[],
  club_budget text CHECK (club_budget IN ('under_300', '300-600', '600-1000', '1000-1500', '1500_plus', 'no_budget')),
  preferred_brands text[],
  club_priorities text[],
  physical_considerations text[],
  
  -- Membership
  membership_tier text DEFAULT 'free' CHECK (membership_tier IN ('free', 'single_club', 'full_bag', 'premium', 'premium_plus')),
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

COMMENT ON TABLE user_profiles IS 'Stores permanent user profile data for pre-filling fittings';