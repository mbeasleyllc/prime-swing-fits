-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into profiles table
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    phone,
    handicap_index,
    preferred_hand,
    years_playing,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NULL,
    NULL,
    NULL,
    'right',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill function for existing auth users without profiles
CREATE OR REPLACE FUNCTION public.backfill_user_profiles()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    -- Insert into users table if missing
    INSERT INTO public.users (id, email, role, created_at)
    VALUES (
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'role', 'user'),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert into profiles table
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      avatar_url,
      phone,
      handicap_index,
      preferred_hand,
      years_playing,
      created_at,
      updated_at
    )
    VALUES (
      auth_user.id,
      COALESCE(auth_user.raw_user_meta_data->>'full_name', 'User'),
      auth_user.email,
      NULL,
      NULL,
      NULL,
      'right',
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run backfill for existing users
SELECT public.backfill_user_profiles();