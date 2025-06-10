-- Fix profiles table constraints
ALTER TABLE profiles ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE profiles DROP COLUMN IF EXISTS first_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_name;

-- Add is_admin column to users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Update profiles to use name from users table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
UPDATE profiles p 
SET display_name = u.name 
FROM users u 
WHERE p.user_id = u.id 
AND p.display_name IS NULL;

-- Ensure all users have profiles
INSERT INTO profiles (user_id, display_name)
SELECT u.id, u.name
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id
WHERE p.id IS NULL;

-- Add indexes for auth-related queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_token) WHERE verification_token IS NOT NULL;

-- Set default values for required fields
UPDATE users SET is_verified = FALSE WHERE is_verified IS NULL;
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
UPDATE users SET is_admin = FALSE WHERE is_admin IS NULL; 