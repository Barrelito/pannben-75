-- Add is_completed column to daily_logs
ALTER TABLE daily_logs 
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;

-- Update RLS if necessary (usually not needed for adding columns to existing accessible tables)
-- Validating type for existing logs (optional, default handles it)
