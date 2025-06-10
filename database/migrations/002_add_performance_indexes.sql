-- Add basic index for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users (latitude, longitude);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_profiles_discovery ON profiles (
  user_id,
  profile_completion_percentage DESC
);

CREATE INDEX IF NOT EXISTS idx_users_active_premium ON users (
  is_active,
  subscription_type,
  last_active DESC
);

CREATE INDEX IF NOT EXISTS idx_swipes_compound ON swipes (
  swiper_id,
  swiped_id,
  is_like,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS idx_matches_users_compound ON matches (
  user1_id,
  user2_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS idx_messages_match_compound ON messages (
  match_id,
  created_at DESC,
  is_read
);

-- Add partial indexes for frequently filtered conditions
CREATE INDEX IF NOT EXISTS idx_users_active_verified ON users (id)
WHERE is_active = true AND is_verified = true;

CREATE INDEX IF NOT EXISTS idx_profiles_high_completion ON profiles (user_id)
WHERE profile_completion_percentage >= 80;

CREATE INDEX IF NOT EXISTS idx_premium_users ON users (id)
WHERE subscription_type IN ('gold', 'platinum');

-- Add indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_profiles_bio_fts ON profiles USING gin(to_tsvector('english', bio));
CREATE INDEX IF NOT EXISTS idx_profiles_interests_array ON profiles USING gin(interests);

-- Add indexes for timestamp range queries
CREATE INDEX IF NOT EXISTS idx_users_last_active_range ON users (last_active DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at_range ON messages (created_at DESC);

-- Add indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_compound ON notifications (
  user_id,
  is_read,
  created_at DESC
);

-- Add partial index for unread messages
CREATE INDEX IF NOT EXISTS idx_unread_messages ON messages (match_id, created_at DESC)
WHERE is_read = false;

-- Add index for user preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_compound ON user_preferences (
  user_id,
  show_online_status,
  show_distance
);

-- Add index for reports
CREATE INDEX IF NOT EXISTS idx_reports_status_priority ON reports (
  status,
  priority,
  created_at DESC
);

-- Add index for subscription management
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry ON subscriptions (
  user_id,
  status,
  current_period_end
);

-- Add index for blocks
CREATE INDEX IF NOT EXISTS idx_blocks_compound ON blocks (
  blocker_id,
  blocked_id,
  created_at DESC
);

-- Add index for user activities
CREATE INDEX IF NOT EXISTS idx_user_activities_compound ON user_activities (
  user_id,
  activity_type,
  created_at DESC
); 