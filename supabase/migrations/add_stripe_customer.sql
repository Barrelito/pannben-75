-- Add Stripe customer ID to profiles for payment tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Index for fast customer lookup
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payment tracking';
