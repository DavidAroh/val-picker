-- Quick fix for registration deadline issue
-- Run this in Supabase SQL Editor to immediately fix the registration error

UPDATE events 
SET 
    registration_deadline = '2026-03-01 23:59:59+00',
    draw_date = '2026-03-02 00:00:00+00',
    event_date = '2026-03-14 00:00:00+00',
    status = 'REGISTRATION_OPEN'
WHERE id = 'valentine-2026';

-- Verify the update
SELECT id, name, registration_deadline, draw_date, event_date, status 
FROM events 
WHERE id = 'valentine-2026';
