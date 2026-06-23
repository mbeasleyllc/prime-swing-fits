-- Add budget_range to player_profile if missing
ALTER TABLE player_profile 
ADD COLUMN IF NOT EXISTS budget_range text DEFAULT 'mid_range';

-- Add all missing fields to fitting_recommendations
ALTER TABLE fitting_recommendations
ADD COLUMN IF NOT EXISTS predicted_driver_gain text,
ADD COLUMN IF NOT EXISTS predicted_accuracy text,
ADD COLUMN IF NOT EXISTS predicted_consistency text,
ADD COLUMN IF NOT EXISTS gaps_identified text[],
ADD COLUMN IF NOT EXISTS redundancies text[],
ADD COLUMN IF NOT EXISTS recommended_bag text,
ADD COLUMN IF NOT EXISTS driver_confidence int,
ADD COLUMN IF NOT EXISTS irons_confidence int,
ADD COLUMN IF NOT EXISTS wedge_confidence int,
ADD COLUMN IF NOT EXISTS putter_confidence int,
ADD COLUMN IF NOT EXISTS driver_spec text,
ADD COLUMN IF NOT EXISTS fairway_woods text,
ADD COLUMN IF NOT EXISTS hybrids text,
ADD COLUMN IF NOT EXISTS irons_spec text,
ADD COLUMN IF NOT EXISTS wedges_spec text,
ADD COLUMN IF NOT EXISTS putter_spec text;