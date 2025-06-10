-- Drop old email verifications table if it exists
DROP TABLE IF EXISTS email_verifications CASCADE;

-- Make sure verification columns exist in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;

-- Add index for faster verification token lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- Make sure is_verified column exists in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE; 