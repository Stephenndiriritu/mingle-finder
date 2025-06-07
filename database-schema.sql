-- Mingle Finder Database Schema for Hostinger

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  gender VARCHAR(50),
  birthdate DATE,
  location VARCHAR(255),
  profile_image_url VARCHAR(255),
  subscription_type VARCHAR(50) DEFAULT 'free',
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  two_factor_backup_codes TEXT[]
);

-- Profiles table
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  interests TEXT[],
  photos TEXT[],
  age INTEGER,
  height INTEGER,
  occupation VARCHAR(100),
  education VARCHAR(100),
  looking_for VARCHAR(50),
  max_distance INTEGER DEFAULT 50,
  age_min INTEGER DEFAULT 18,
  age_max INTEGER DEFAULT 99,
  show_me VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swipes table
CREATE TABLE swipes (
  id SERIAL PRIMARY KEY,
  swiper_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  swiped_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(swiper_id, swiped_id)
);

-- Matches table
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports table
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reported_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    story TEXT NOT NULL,
    photo_url VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by INTEGER REFERENCES users(id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Two factor temporary secrets table
CREATE TABLE IF NOT EXISTS two_factor_temp (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  secret VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_token)
);

-- Data exports table
CREATE TABLE IF NOT EXISTS data_exports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  export_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  download_url TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(export_id)
);

-- Payment orders table
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  order_id VARCHAR(255) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(order_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped_id ON swipes(swiped_id);
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_testimonials_approved ON testimonials(is_approved, is_featured);
CREATE INDEX idx_testimonials_user ON testimonials(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_data_exports_export_id ON data_exports(export_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id, stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_type, subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);

-- Function to create match when mutual like occurs
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_like = true THEN
      IF EXISTS (
          SELECT 1 FROM swipes 
          WHERE swiper_id = NEW.swiped_id 
          AND swiped_id = NEW.swiper_id 
          AND is_like = true
      ) THEN
          INSERT INTO matches (user1_id, user2_id)
          VALUES (
              LEAST(NEW.swiper_id, NEW.swiped_id),
              GREATEST(NEW.swiper_id, NEW.swiped_id)
          )
          ON CONFLICT (user1_id, user2_id) DO NOTHING;
      END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create matches
CREATE TRIGGER trigger_create_match
  AFTER INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_mutual_like();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, is_admin, is_active) 
VALUES (
  'admin@minglefinder.com', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
  'Admin User', 
  true, 
  true
);

-- Create initial profile for admin
INSERT INTO profiles (user_id) 
SELECT id FROM users WHERE email = 'admin@minglefinder.com';
