-- Secret Valentine Exchange Database Schema
-- Version: 1.1 (Updated with fixes)
-- Description: Complete schema for Valentine Exchange platform with auto-confirm and updated dates

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users table: Store user profiles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    work TEXT,
    hobbies TEXT,
    profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Events table: Manage Valentine events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'REGISTRATION_OPEN',
    participant_count INTEGER DEFAULT 0,
    matches_generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table: Store Valentine assignments
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    giver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revealed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints to ensure valid matches
    CONSTRAINT no_self_match CHECK (giver_id != receiver_id),
    CONSTRAINT unique_giver_per_event UNIQUE (event_id, giver_id),
    CONSTRAINT unique_receiver_per_event UNIQUE (event_id, receiver_id)
);

-- Wishlist items table: User gift wishlists
CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    link TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    display_order INTEGER DEFAULT 0
);

-- Chat threads table: Conversation threads between matches
CREATE TABLE IF NOT EXISTS chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- Messages table: Chat messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    image_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient message queries
CREATE INDEX IF NOT EXISTS idx_messages_thread_sent ON messages(thread_id, sent_at);

-- Notifications table: User notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT,
    action_url TEXT,
    data JSONB,
    read BOOLEAN DEFAULT false,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Activity logs table: Track user actions
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    event_id VARCHAR(50),
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient activity log queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_timestamp ON activity_logs(user_id, timestamp);

-- Invitations table: Friend invitation tracking
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inviter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update event participant count
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE events
    SET participant_count = (
        SELECT COUNT(DISTINCT giver_id)
        FROM matches
        WHERE event_id = NEW.event_id
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for match creation
DROP TRIGGER IF EXISTS update_participant_count ON matches;
CREATE TRIGGER update_participant_count
    AFTER INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participant_count();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default Valentine 2026 event with updated dates
INSERT INTO events (id, name, registration_deadline, draw_date, event_date, status)
VALUES (
    'valentine-2026',
    'Valentine Exchange 2026',
    '2026-03-01 23:59:59+00',  -- Extended for testing
    '2026-03-02 00:00:00+00',  -- Draw date
    '2026-03-14 00:00:00+00',  -- Event date
    'REGISTRATION_OPEN'
)
ON CONFLICT (id) DO UPDATE SET
    registration_deadline = EXCLUDED.registration_deadline,
    draw_date = EXCLUDED.draw_date,
    event_date = EXCLUDED.event_date,
    status = EXCLUDED.status;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Users: Can read their own profile, service role can do everything
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role has full access to users" ON users;
CREATE POLICY "Service role has full access to users" ON users
    USING (auth.jwt()->>'role' = 'service_role');

-- Events: Everyone can read events
DROP POLICY IF EXISTS "Anyone can read events" ON events;
CREATE POLICY "Anyone can read events" ON events
    FOR SELECT USING (true);

-- Matches: Users can see their own matches after draw
DROP POLICY IF EXISTS "Users can see own matches" ON matches;
CREATE POLICY "Users can see own matches" ON matches
    FOR SELECT USING (giver_id = auth.uid() OR receiver_id = auth.uid());

-- Wishlist: Users can manage their own wishlist, others can read after match
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist_items;
CREATE POLICY "Users can manage own wishlist" ON wishlist_items
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read match wishlist" ON wishlist_items;
CREATE POLICY "Users can read match wishlist" ON wishlist_items
    FOR SELECT USING (
        user_id IN (
            SELECT receiver_id FROM matches WHERE giver_id = auth.uid()
        )
    );

-- Chat threads: Users can access threads they're part of
DROP POLICY IF EXISTS "Users can access own chat threads" ON chat_threads;
CREATE POLICY "Users can access own chat threads" ON chat_threads
    FOR SELECT USING (
        match_id IN (
            SELECT id FROM matches 
            WHERE giver_id = auth.uid() OR receiver_id = auth.uid()
        )
    );

-- Messages: Users can read/send in their chat threads
DROP POLICY IF EXISTS "Users can read messages in their threads" ON messages;
CREATE POLICY "Users can read messages in their threads" ON messages
    FOR SELECT USING (
        thread_id IN (
            SELECT ct.id FROM chat_threads ct
            JOIN matches m ON ct.match_id = m.id
            WHERE m.giver_id = auth.uid() OR m.receiver_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
CREATE POLICY "Users can send messages in their threads" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        thread_id IN (
            SELECT ct.id FROM chat_threads ct
            JOIN matches m ON ct.match_id = m.id
            WHERE m.giver_id = auth.uid() OR m.receiver_id = auth.uid()
        )
    );

-- Notifications: Users can read/update their own notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Activity logs: Users can read their own logs
DROP POLICY IF EXISTS "Users can read own activity logs" ON activity_logs;
CREATE POLICY "Users can read own activity logs" ON activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- Invitations: Open read for validation, users can create
DROP POLICY IF EXISTS "Anyone can read invitations for validation" ON invitations;
CREATE POLICY "Anyone can read invitations for validation" ON invitations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create invitations" ON invitations;
CREATE POLICY "Users can create invitations" ON invitations
    FOR INSERT WITH CHECK (inviter_id = auth.uid());

-- ============================================
-- SUMMARY OF UPDATES
-- ============================================
-- 1. Added DROP POLICY IF EXISTS before all CREATE POLICY statements (idempotent)
-- 2. Updated event dates to March 2026 for testing
-- 3. Changed ON CONFLICT DO NOTHING to ON CONFLICT DO UPDATE for events
-- 4. Added data column to notifications table (JSONB)
-- 5. Email verification is auto-confirmed via API (email_confirm: true)
