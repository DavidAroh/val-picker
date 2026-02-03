-- Complete cleanup: Delete users from both Auth and Database
-- Run this in Supabase SQL Editor

-- Step 1: Get list of user IDs to delete from Auth
SELECT id, email FROM auth.users;

-- Step 2: Delete from database tables (cascades to related data)
DELETE FROM users;

-- Step 3: Delete from Supabase Auth
-- This requires admin privileges
DELETE FROM auth.users;

-- Step 4: Verify everything is deleted
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM users) as db_users,
    (SELECT COUNT(*) FROM wishlist_items) as wishlist,
    (SELECT COUNT(*) FROM matches) as matches,
    (SELECT COUNT(*) FROM notifications) as notifications;

-- Expected: All counts should be 0
