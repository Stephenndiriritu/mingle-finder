-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    birthdate DATE,
    gender VARCHAR(20),
    location VARCHAR(255),
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_type VARCHAR(20) DEFAULT 'free',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    gender VARCHAR(20),
    birth_date DATE,
    bio TEXT,
    interests TEXT[],
    profile_picture_url TEXT,
    age INTEGER,
    profile_completion_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID REFERENCES users(id) ON DELETE CASCADE,
    swiped_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(swiper_id, swiped_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    min_age INTEGER,
    max_age INTEGER,
    distance_preference INTEGER,
    gender_preference VARCHAR(20)[],
    show_online_status BOOLEAN DEFAULT TRUE,
    show_distance BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create password reset table
CREATE TABLE IF NOT EXISTS password_resets (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    story TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_location ON users (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_active_premium ON users (is_active, subscription_type, last_active DESC);
CREATE INDEX IF NOT EXISTS idx_users_active_verified ON users (id) WHERE is_active = true AND is_verified = true;
CREATE INDEX IF NOT EXISTS idx_premium_users ON users (id) WHERE subscription_type IN ('gold', 'platinum');
CREATE INDEX IF NOT EXISTS idx_users_last_active_range ON users (last_active DESC);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_discovery ON profiles (user_id, profile_completion_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_high_completion ON profiles (user_id) WHERE profile_completion_percentage >= 80;
CREATE INDEX IF NOT EXISTS idx_profiles_bio_fts ON profiles USING gin(to_tsvector('english', bio));
CREATE INDEX IF NOT EXISTS idx_profiles_interests_array ON profiles USING gin(interests);

-- Swipes and matches indexes
CREATE INDEX IF NOT EXISTS idx_swipes_compound ON swipes (swiper_id, swiped_id, is_like, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_users_compound ON matches (user1_id, user2_id, created_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_match_compound ON messages (match_id, created_at DESC, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at_range ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_unread_messages ON messages (match_id, created_at DESC) WHERE is_read = false;

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_compound ON notifications (user_id, is_read, created_at DESC);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_compound ON user_preferences (user_id, show_online_status, show_distance);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_status_priority ON reports (status, priority, created_at DESC);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry ON subscriptions (user_id, status, current_period_end);

-- Blocks indexes
CREATE INDEX IF NOT EXISTS idx_blocks_compound ON blocks (blocker_id, blocked_id, created_at DESC);

-- User activities indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_compound ON user_activities (user_id, activity_type, created_at DESC);

-- Testimonials indexes
CREATE INDEX IF NOT EXISTS testimonials_user_id_idx ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS testimonials_is_approved_idx ON testimonials(is_approved);

-- Admin notifications indexes
CREATE INDEX IF NOT EXISTS admin_notifications_type_idx ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS admin_notifications_is_read_idx ON admin_notifications(is_read); 