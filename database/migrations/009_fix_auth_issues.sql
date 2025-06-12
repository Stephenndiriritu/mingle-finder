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

-- Add display_name column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

-- Safely update display_name using existing columns if they exist
DO $$
BEGIN
  -- Check if first_name column exists and update display_name accordingly
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'first_name'
  ) THEN
    -- Update display_name from existing first_name and last_name
    UPDATE profiles
    SET display_name = COALESCE(
      CASE
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
        WHEN first_name IS NOT NULL THEN first_name
        ELSE 'User'
      END
    )
    WHERE display_name IS NULL OR display_name = '';

    -- Make first_name nullable since we're using display_name
    ALTER TABLE profiles ALTER COLUMN first_name DROP NOT NULL;
  ELSE
    -- If first_name doesn't exist, just set default display_name
    UPDATE profiles
    SET display_name = 'User'
    WHERE display_name IS NULL OR display_name = '';
  END IF;
END $$;

-- Ensure all users have profiles with a default display_name
INSERT INTO profiles (user_id, display_name)
SELECT u.id, 'User'
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