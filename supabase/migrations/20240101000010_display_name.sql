-- Add display_name column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add comment
COMMENT ON COLUMN profiles.display_name IS 'User display name shown in Squad';
