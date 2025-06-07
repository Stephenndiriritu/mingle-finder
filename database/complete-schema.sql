-- Mingle Finder Complete Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  reset_token_expires_at TIMESTAMP
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
  weight INTEGER,
  body_type VARCHAR(20),
  ethnicity VARCHAR(50),
  occupation VARCHAR(100),
  education VARCHAR(100),
  school VARCHAR(100),
  company VARCHAR(100),
  job_title VARCHAR(100),
  looking_for VARCHAR(50),
  relationship_type VARCHAR(50),
  relationship_status VARCHAR(30),
  max_distance INTEGER DEFAULT 50,
  age_min INTEGER DEFAULT 18,
  age_max INTEGER DEFAULT 99,
  show_me VARCHAR(20),
  smoking VARCHAR(20),
  drinking VARCHAR(20),
  drugs VARCHAR(20),
  children VARCHAR(20),
  want_children VARCHAR(20),
  religion VARCHAR(50),
  political_views VARCHAR(50),
  languages TEXT[],
  hobbies TEXT[],
  music_preferences TEXT[],
  movie_preferences TEXT[],
  book_preferences TEXT[],
  travel_preferences TEXT[],
  food_preferences TEXT[],
  fitness_level VARCHAR(20),
  diet_preferences VARCHAR(20),
  pet_preferences VARCHAR(20),
  pets TEXT[],
  social_media_links JSONB,
  verification_status VARCHAR(20) DEFAULT 'unverified',
  verification_photos TEXT[],
  profile_completion_percentage INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP,
  boost_count INTEGER DEFAULT 0,
  last_boost TIMESTAMP,
  super_likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swipes table
CREATE TABLE swipes (
  id SERIAL PRIMARY KEY,
  swiper_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  swiped_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL,
  is_super_like BOOLEAN DEFAULT false,
  is_boost_swipe BOOLEAN DEFAULT false,
  swipe_direction VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(swiper_id, swiped_id)
);

-- Matches table
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  compatibility_score INTEGER DEFAULT 0,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  media_url TEXT,
  media_type VARCHAR(20),
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  reply_to_id INTEGER REFERENCES messages(id),
  read_at TIMESTAMP,
  delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reported_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(10) DEFAULT 'medium',
  admin_notes TEXT,
  resolved_by INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocks table
CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  blocker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  blocked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_id, blocked_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boosts table
CREATE TABLE boosts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  boost_type VARCHAR(20) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  views_gained INTEGER DEFAULT 0,
  likes_gained INTEGER DEFAULT 0
);

-- Super likes table
CREATE TABLE super_likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  used_count INTEGER DEFAULT 0,
  reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advertisements table
CREATE TABLE advertisements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  target_url TEXT,
  target_age_min INTEGER,
  target_age_max INTEGER,
  target_gender VARCHAR(20),
  target_location VARCHAR(100),
  target_interests TEXT[],
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad impressions table
CREATE TABLE ad_impressions (
  id SERIAL PRIMARY KEY,
  ad_id INTEGER REFERENCES advertisements(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad clicks table
CREATE TABLE ad_clicks (
  id SERIAL PRIMARY KEY,
  ad_id INTEGER REFERENCES advertisements(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  is_pushed BOOLEAN DEFAULT false,
  is_emailed BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  match_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  like_notifications BOOLEAN DEFAULT true,
  super_like_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  newsletter BOOLEAN DEFAULT false,
  privacy_mode BOOLEAN DEFAULT false,
  show_online_status BOOLEAN DEFAULT true,
  show_distance BOOLEAN DEFAULT true,
  show_age BOOLEAN DEFAULT true,
  auto_play_videos BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photo verification table
CREATE TABLE photo_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'pending',
  verification_type VARCHAR(20) DEFAULT 'manual',
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  confidence_score DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activities table
CREATE TABLE user_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB,
  ip_address INET,
  user_agent TEXT,
  location VARCHAR(100),
  device_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status VARCHAR(20) DEFAULT 'open',
  response TEXT,
  responded_by INTEGER REFERENCES users(id),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(30),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  price DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event attendees table
CREATE TABLE event_attendees (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'attending',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- Gifts table
CREATE TABLE gifts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(30),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gift transactions table
CREATE TABLE gift_transactions (
  id SERIAL PRIMARY KEY,
  gift_id INTEGER REFERENCES gifts(id),
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  amount DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(latitude, longitude);
CREATE INDEX idx_users_last_active ON users(last_active_at);
CREATE INDEX idx_users_subscription ON users(subscription_type);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_profiles_completion ON profiles(profile_completion_percentage);
CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped_id ON swipes(swiped_id);
CREATE INDEX idx_swipes_created_at ON swipes(created_at);
CREATE INDEX idx_swipes_is_like ON swipes(is_like);
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_created_at ON matches(created_at);
CREATE INDEX idx_matches_active ON matches(is_active);
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_activities_type ON user_activities(activity_type);
CREATE INDEX idx_activities_created_at ON user_activities(created_at);

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Earth's radius in kilometers
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;
    
    dLat := RADIANS(lat2 - lat1);
    dLon := RADIANS(lon2 - lon1);
    a := SIN(dLat/2) * SIN(dLat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dLon/2) * SIN(dLon/2);
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

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
            
            -- Create notifications for both users
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES 
                (NEW.swiper_id, 'match', 'New Match!', 'You have a new match!', 
                 json_build_object('match_user_id', NEW.swiped_id)),
                (NEW.swiped_id, 'match', 'New Match!', 'You have a new match!', 
                 json_build_object('match_user_id', NEW.swiper_id));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
    completion_score INTEGER := 0;
BEGIN
    -- Calculate completion percentage based on filled fields
    IF NEW.bio IS NOT NULL AND LENGTH(NEW.bio) > 0 THEN completion_score := completion_score + 10; END IF;
    IF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) > 0 THEN completion_score := completion_score + 10; END IF;
    IF NEW.photos IS NOT NULL AND array_length(NEW.photos, 1) > 0 THEN completion_score := completion_score + 20; END IF;
    IF NEW.occupation IS NOT NULL AND LENGTH(NEW.occupation) > 0 THEN completion_score := completion_score + 8; END IF;
    IF NEW.education IS NOT NULL AND LENGTH(NEW.education) > 0 THEN completion_score := completion_score + 8; END IF;
    IF NEW.height IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.smoking IS NOT NULL THEN completion_score := completion_score + 4; END IF;
    IF NEW.drinking IS NOT NULL THEN completion_score := completion_score + 4; END IF;
    IF NEW.children IS NOT NULL THEN completion_score := completion_score + 4; END IF;
    IF NEW.religion IS NOT NULL THEN completion_score := completion_score + 4; END IF;
    IF NEW.hobbies IS NOT NULL AND array_length(NEW.hobbies, 1) > 0 THEN completion_score := completion_score + 8; END IF;
    IF NEW.languages IS NOT NULL AND array_length(NEW.languages, 1) > 0 THEN completion_score := completion_score + 5; END IF;
    IF NEW.looking_for IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.relationship_type IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF NEW.body_type IS NOT NULL THEN completion_score := completion_score + 3; END IF;
    IF NEW.ethnicity IS NOT NULL THEN completion_score := completion_score + 3; END IF;
    
    NEW.profile_completion_percentage := LEAST(completion_score, 100);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user last active
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_create_match
    AFTER INSERT ON swipes
    FOR EACH ROW
    EXECUTE FUNCTION create_match_on_mutual_like();

CREATE TRIGGER trigger_update_profile_completion
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER trigger_update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

CREATE TRIGGER trigger_update_profiles_timestamp
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, is_verified, verification_token) 
VALUES (
    'admin@minglefinder.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
    'Admin User', 
    true,
    'admin_verification_token'
);

-- Create initial profile for admin
INSERT INTO profiles (user_id, bio, interests, age) 
SELECT id, 'System Administrator for Mingle Finder', ARRAY['Technology', 'Management', 'Dating Apps'], 30
FROM users WHERE email = 'admin@minglefinder.com';

-- Create default user preferences for admin
INSERT INTO user_preferences (user_id)
SELECT id FROM users WHERE email = 'admin@minglefinder.com';

-- Sample data for testing (password for all: password123)
INSERT INTO users (email, password_hash, name, date_of_birth, gender, location, latitude, longitude) VALUES
('john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'John Doe', '1990-05-15', 'male', 'New York, NY', 40.7128, -74.0060),
('jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Jane Smith', '1992-08-22', 'female', 'Los Angeles, CA', 34.0522, -118.2437),
('mike@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Mike Johnson', '1988-12-03', 'male', 'Chicago, IL', 41.8781, -87.6298),
('sarah@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Sarah Wilson', '1995-03-10', 'female', 'Miami, FL', 25.7617, -80.1918),
('alex@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Alex Brown', '1991-11-28', 'non-binary', 'Seattle, WA', 47.6062, -122.3321);

-- Sample profiles with rich data
INSERT INTO profiles (user_id, bio, interests, age, height, occupation, education, hobbies, looking_for, relationship_type) VALUES
((SELECT id FROM users WHERE email = 'john@example.com'), 
 'Love hiking and photography. Always up for an adventure! 📸🏔️', 
 ARRAY['Photography', 'Hiking', 'Travel', 'Coffee', 'Technology'], 
 34, 180, 'Software Engineer', 'Computer Science', 
 ARRAY['Rock Climbing', 'Cooking', 'Reading'], 'serious_relationship', 'monogamous'),

((SELECT id FROM users WHERE email = 'jane@example.com'), 
 'Yoga instructor and food lover. Seeking genuine connections 🧘‍♀️🍃', 
 ARRAY['Yoga', 'Cooking', 'Health', 'Meditation', 'Nature'], 
 32, 165, 'Yoga Instructor', 'Health Sciences', 
 ARRAY['Meditation', 'Gardening', 'Dancing'], 'serious_relationship', 'monogamous'),

((SELECT id FROM users WHERE email = 'mike@example.com'), 
 'Musician and coffee enthusiast. Life is better with good music ☕🎵', 
 ARRAY['Music', 'Coffee', 'Art', 'Concerts', 'Vinyl Records'], 
 36, 175, 'Musician', 'Music Theory', 
 ARRAY['Guitar Playing', 'Songwriting', 'Coffee Roasting'], 'casual_dating', 'open'),

((SELECT id FROM users WHERE email = 'sarah@example.com'), 
 'Beach lover and entrepreneur. Building my dream business 🏖️💼', 
 ARRAY['Business', 'Beach', 'Fitness', 'Networking', 'Travel'], 
 29, 170, 'Entrepreneur', 'Business Administration', 
 ARRAY['Surfing', 'Running', 'Podcasts'], 'serious_relationship', 'monogamous'),

((SELECT id FROM users WHERE email = 'alex@example.com'), 
 'Artist and dreamer. Creating beautiful things every day 🎨✨', 
 ARRAY['Art', 'Design', 'Museums', 'Creativity', 'Philosophy'], 
 33, 168, 'Graphic Designer', 'Fine Arts', 
 ARRAY['Painting', 'Sketching', 'Gallery Visits'], 'friendship', 'polyamorous');

-- Sample user preferences
INSERT INTO user_preferences (user_id) 
SELECT id FROM users WHERE email IN ('john@example.com', 'jane@example.com', 'mike@example.com', 'sarah@example.com', 'alex@example.com');

-- Sample subscription plans data
INSERT INTO subscriptions (user_id, plan_type, status, current_period_start, current_period_end, amount) VALUES
((SELECT id FROM users WHERE email = 'mike@example.com'), 'gold', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month', 9.99);

-- Sample notifications
INSERT INTO notifications (user_id, type, title, message) VALUES
((SELECT id FROM users WHERE email = 'john@example.com'), 'welcome', 'Welcome to Mingle Finder!', 'Complete your profile to get better matches'),
((SELECT id FROM users WHERE email = 'jane@example.com'), 'profile_tip', 'Profile Tip', 'Add more photos to increase your match rate by 40%');

-- Sample activities
INSERT INTO user_activities (user_id, activity_type, activity_data) VALUES
((SELECT id FROM users WHERE email = 'john@example.com'), 'profile_view', '{"viewed_user_id": 2}'),
((SELECT id FROM users WHERE email = 'jane@example.com'), 'login', '{"device": "mobile", "location": "Los Angeles"}');
