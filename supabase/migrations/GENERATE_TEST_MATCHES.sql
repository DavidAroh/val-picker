-- Generate test users and matches for Valentine Exchange
-- Run this in Supabase SQL Editor

-- Step 1: Create test users in the users table
-- Note: You'll need to create these in Supabase Auth manually OR use the registration flow

-- For now, let's assume you have at least 2 users registered
-- Get the current user IDs
SELECT id, email, name FROM users;

-- Step 2: Generate matches manually for testing
-- Replace USER_ID_1 and USER_ID_2 with actual user IDs from the query above

-- Example: If you have 2 users, create a match between them
-- INSERT INTO matches (event_id, giver_id, receiver_id, assigned_at)
-- VALUES 
--     ('valentine-2026', 'USER_ID_1', 'USER_ID_2', NOW()),
--     ('valentine-2026', 'USER_ID_2', 'USER_ID_1', NOW());

-- Step 3: Create chat threads for the matches
-- INSERT INTO chat_threads (match_id)
-- SELECT id FROM matches WHERE event_id = 'valentine-2026';

-- Step 4: Update event status
UPDATE events 
SET 
    status = 'DRAW_LIVE',
    matches_generated_at = NOW()
WHERE id = 'valentine-2026';

-- Step 5: Verify matches were created
SELECT 
    m.id,
    g.name as giver_name,
    r.name as receiver_name,
    m.assigned_at,
    m.revealed_at
FROM matches m
JOIN users g ON m.giver_id = g.id
JOIN users r ON m.receiver_id = r.id
WHERE m.event_id = 'valentine-2026';
