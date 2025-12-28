-- Add diet selection to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_diet_id UUID REFERENCES diet_tracks(id);

-- Add comment
COMMENT ON COLUMN profiles.selected_diet_id IS 'User selected diet track';
