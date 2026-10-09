-- Add golf_balls_spec column to store all golf ball recommendations
ALTER TABLE fitting_recommendations 
ADD COLUMN IF NOT EXISTS golf_balls_spec jsonb;

-- Add a comment explaining the column
COMMENT ON COLUMN fitting_recommendations.golf_balls_spec IS 'JSON array of all golf ball recommendations (top 5)';