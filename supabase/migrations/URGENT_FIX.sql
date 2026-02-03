-- URGENT FIX: Update event dates to allow registration
-- Copy and paste this ENTIRE script into Supabase SQL Editor and click RUN

-- Step 1: Update the event dates
UPDATE events 
SET 
    registration_deadline = '2026-12-31 23:59:59+00',  -- Extended to end of year
    draw_date = '2027-01-01 00:00:00+00',
    event_date = '2027-02-14 00:00:00+00',
    status = 'REGISTRATION_OPEN'
WHERE id = 'valentine-2026';

-- Step 2: Verify the update worked
SELECT 
    id, 
    name, 
    registration_deadline, 
    draw_date, 
    event_date, 
    status,
    NOW() as current_time,
    CASE 
        WHEN NOW() < registration_deadline THEN 'REGISTRATION OPEN ✅'
        ELSE 'REGISTRATION CLOSED ❌'
    END as registration_status
FROM events 
WHERE id = 'valentine-2026';

-- If you see "REGISTRATION OPEN ✅" in the results, you're good to go!
