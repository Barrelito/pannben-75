-- Add progress photo URL to daily logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS progress_photo_url TEXT;

-- Add comment
COMMENT ON COLUMN daily_logs.progress_photo_url IS 'Public URL to uploaded progress photo in Supabase Storage';
