-- Create conversations system to allow anyone to chat with anyone
-- while keeping premium restrictions

-- Create conversations table to track direct conversations between users
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_by UUID REFERENCES users(id),
    
    -- Ensure unique conversation between two users (regardless of order)
    CONSTRAINT unique_conversation UNIQUE (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
);

-- Update messages table to support both match-based and direct conversations
-- Add conversation_id column to messages table
DO $$ 
BEGIN
    -- Add conversation_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
    END IF;
    
    -- Add receiver_id column if it doesn't exist (for direct messages)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'receiver_id') THEN
        ALTER TABLE messages ADD COLUMN receiver_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Make match_id nullable since we now support direct conversations
    ALTER TABLE messages ALTER COLUMN match_id DROP NOT NULL;
END $$;

-- Add constraint to ensure message has either match_id or conversation_id
ALTER TABLE messages ADD CONSTRAINT check_message_context 
    CHECK ((match_id IS NOT NULL AND conversation_id IS NULL) OR 
           (match_id IS NULL AND conversation_id IS NOT NULL));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- Create function to get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_uuid UUID, user2_uuid UUID)
RETURNS UUID AS $$
DECLARE
    conversation_uuid UUID;
    min_user_id UUID;
    max_user_id UUID;
BEGIN
    -- Ensure consistent ordering of user IDs
    IF user1_uuid < user2_uuid THEN
        min_user_id := user1_uuid;
        max_user_id := user2_uuid;
    ELSE
        min_user_id := user2_uuid;
        max_user_id := user1_uuid;
    END IF;
    
    -- Try to find existing conversation
    SELECT id INTO conversation_uuid
    FROM conversations
    WHERE user1_id = min_user_id AND user2_id = max_user_id;
    
    -- If no conversation exists, create one
    IF conversation_uuid IS NULL THEN
        INSERT INTO conversations (user1_id, user2_id)
        VALUES (min_user_id, max_user_id)
        RETURNING id INTO conversation_uuid;
    END IF;
    
    RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to update conversation timestamp when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update conversation's last_message_at and updated_at
    IF NEW.conversation_id IS NOT NULL THEN
        UPDATE conversations 
        SET last_message_at = NEW.created_at,
            updated_at = NEW.created_at
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update conversation timestamp
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Create view for easy conversation listing with latest message info
CREATE OR REPLACE VIEW conversation_list AS
SELECT 
    c.id as conversation_id,
    c.user1_id,
    c.user2_id,
    c.created_at as conversation_created_at,
    c.last_message_at,
    c.is_blocked,
    c.blocked_by,
    m.content as last_message,
    m.sender_id as last_message_sender_id,
    m.created_at as last_message_created_at,
    u1.name as user1_name,
    u2.name as user2_name,
    p1.first_name as user1_first_name,
    p1.last_name as user1_last_name,
    p1.profile_picture_url as user1_photo,
    p2.first_name as user2_first_name,
    p2.last_name as user2_last_name,
    p2.profile_picture_url as user2_photo
FROM conversations c
LEFT JOIN users u1 ON c.user1_id = u1.id
LEFT JOIN users u2 ON c.user2_id = u2.id
LEFT JOIN profiles p1 ON c.user1_id = p1.user_id
LEFT JOIN profiles p2 ON c.user2_id = p2.user_id
LEFT JOIN LATERAL (
    SELECT content, sender_id, created_at
    FROM messages 
    WHERE conversation_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
) m ON true
ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC;

-- Migrate existing match-based messages to conversations (optional)
-- This creates conversations for existing matches with messages
INSERT INTO conversations (user1_id, user2_id, created_at, last_message_at)
SELECT 
    LEAST(m.user1_id, m.user2_id) as user1_id,
    GREATEST(m.user1_id, m.user2_id) as user2_id,
    m.created_at,
    (SELECT MAX(msg.created_at) FROM messages msg WHERE msg.match_id = m.id)
FROM matches m
WHERE EXISTS (SELECT 1 FROM messages WHERE match_id = m.id)
ON CONFLICT (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id)) DO NOTHING;

-- Update existing messages to link to conversations
UPDATE messages 
SET conversation_id = c.id
FROM conversations c
JOIN matches m ON (
    (c.user1_id = m.user1_id AND c.user2_id = m.user2_id) OR
    (c.user1_id = m.user2_id AND c.user2_id = m.user1_id)
)
WHERE messages.match_id = m.id AND messages.conversation_id IS NULL;

COMMIT;
