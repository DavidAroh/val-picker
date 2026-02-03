-- Delete all registered users
-- Run this in Supabase SQL Editor

-- Step 1: Delete from users table (this will cascade to related tables)
DELETE FROM users;

-- Step 2: Delete from Supabase Auth
-- Note: You need to do this manually in Supabase Dashboard
-- Go to: Authentication → Users → Select users → Delete

-- Verify deletion
SELECT COUNT(*) as user_count FROM users;

-- Expected result: user_count = 0

-- Optional: Reset all related data
DELETE FROM wishlist_items;
DELETE FROM matches;
DELETE FROM chat_threads;
DELETE FROM messages;
DELETE FROM notifications;
DELETE FROM activity_logs;
DELETE FROM invitations;
DELETE FROM auth.users;
DELETE FROM users;

-- Verify all tables are empty
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM wishlist_items) as wishlist,
    (SELECT COUNT(*) FROM matches) as matches,
    (SELECT COUNT(*) FROM notifications) as notifications,
    (SELECT COUNT(*) FROM invitations) as invitations;
