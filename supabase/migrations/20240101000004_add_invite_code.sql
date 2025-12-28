-- Add invite code to squads table
ALTER TABLE squads ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_squads_invite_code ON squads(invite_code);

-- Add comment
COMMENT ON COLUMN squads.invite_code IS 'Unique 6-character invite code (format: XXXX-XX)';
