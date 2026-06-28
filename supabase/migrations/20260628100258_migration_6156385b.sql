ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS ai_training_opt_out boolean DEFAULT false;