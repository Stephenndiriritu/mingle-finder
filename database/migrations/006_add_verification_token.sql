-- Add verification token column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

-- Add index for faster verification token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- Drop the separate email_verifications table since we're moving the token to users table
DROP TABLE IF EXISTS email_verifications;

-- Update the users table to include expiry for the verification token
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE; 