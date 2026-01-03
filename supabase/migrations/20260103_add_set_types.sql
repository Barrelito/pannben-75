-- Add set_types array to program_exercises table
-- Allows storing per-set type configuration (e.g., ['warmup', 'normal', 'failure'])

ALTER TABLE program_exercises 
ADD COLUMN IF NOT EXISTS set_types text[] DEFAULT NULL;

COMMENT ON COLUMN program_exercises.set_types IS 'Array of set types for each set (normal, warmup, dropset, failure, amrap, rest_pause)';
