-- Add new columns to fitting_recommendations table for advanced features
ALTER TABLE fitting_recommendations
ADD COLUMN predicted_driver_gain text,
ADD COLUMN predicted_accuracy text,
ADD COLUMN predicted_consistency text,
ADD COLUMN gaps_identified text[],
ADD COLUMN redundancies text[],
ADD COLUMN recommended_bag text,
ADD COLUMN driver_confidence int,
ADD COLUMN irons_confidence int,
ADD COLUMN wedge_confidence int,
ADD COLUMN putter_confidence int,
ADD COLUMN driver_spec text,
ADD COLUMN fairway_woods text,
ADD COLUMN hybrids text,
ADD COLUMN irons_spec text,
ADD COLUMN wedges_spec text,
ADD COLUMN putter_spec text;

-- Add budget_range to player_profile
ALTER TABLE player_profile
ADD COLUMN budget_range text DEFAULT 'mid_range';

COMMENT ON COLUMN player_profile.budget_range IS 'Values: budget | mid_range | premium';