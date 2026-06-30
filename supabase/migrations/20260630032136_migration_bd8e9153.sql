-- Add golf ball recommendation to fitting_recommendations table
ALTER TABLE fitting_recommendations 
ADD COLUMN golf_ball_rec TEXT,
ADD COLUMN ball_compression INTEGER,
ADD COLUMN ball_spin_rating TEXT CHECK (ball_spin_rating IN ('Low', 'Mid', 'High')),
ADD COLUMN ball_optimal_swing_speed TEXT;

-- Add comment for documentation
COMMENT ON COLUMN fitting_recommendations.golf_ball_rec IS 'Recommended golf ball model name';
COMMENT ON COLUMN fitting_recommendations.ball_compression IS 'Ball compression rating (60-110)';
COMMENT ON COLUMN fitting_recommendations.ball_spin_rating IS 'Ball spin characteristics: Low, Mid, or High';
COMMENT ON COLUMN fitting_recommendations.ball_optimal_swing_speed IS 'Optimal swing speed range for this ball (e.g., "90-105 mph")';