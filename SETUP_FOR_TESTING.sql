-- RECOMMENDED: Event dates for immediate testing
-- This allows you to test the full flow TODAY

-- Option 1: IMMEDIATE TESTING (Recommended)
-- Registration open now, draw can happen anytime, event is today
UPDATE events 
SET 
    registration_deadline = '2026-02-03 23:59:59+00',  -- Tomorrow (so you can still register users)
    draw_date = '2026-02-02 12:00:00+00',              -- Today at noon (already passed, can generate matches)
    event_date = '2026-02-02 23:59:59+00',             -- Today (can reveal matches)
    status = 'REGISTRATION_OPEN'
WHERE id = 'valentine-2026';

-- Verify
SELECT 
    id, 
    name, 
    registration_deadline, 
    draw_date, 
    event_date, 
    status,
    NOW() as current_time,
    CASE 
        WHEN NOW() < registration_deadline THEN '✅ REGISTRATION OPEN'
        ELSE '❌ REGISTRATION CLOSED'
    END as registration_status,
    CASE 
        WHEN NOW() >= draw_date THEN '✅ CAN GENERATE MATCHES'
        ELSE '⏳ WAITING FOR DRAW DATE'
    END as draw_status,
    CASE 
        WHEN NOW() >= event_date THEN '✅ CAN REVEAL MATCHES'
        ELSE '⏳ WAITING FOR EVENT DATE'
    END as reveal_status
FROM events 
WHERE id = 'valentine-2026';

-- Expected results:
-- ✅ REGISTRATION OPEN (can register new users)
-- ✅ CAN GENERATE MATCHES (admin can generate matches)
-- ✅ CAN REVEAL MATCHES (users can reveal their valentine)
