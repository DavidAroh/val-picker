import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Test endpoint to verify Supabase connection and database setup
 * Visit: http://localhost:3000/api/test-db
 */
export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Testing Supabase connection...');

        // Test 1: Check if we can connect to Supabase
        const { data: connection, error: connectionError } = await supabaseAdmin
            .from('events')
            .select('*')
            .limit(1);

        if (connectionError) {
            console.error('❌ Database connection error:', connectionError);
            return NextResponse.json({
                success: false,
                error: 'Database connection failed',
                details: connectionError.message,
                hint: 'Make sure you have run the SQL migration in Supabase',
            }, { status: 500 });
        }

        // Test 2: Check if valentine-2026 event exists
        const { data: event, error: eventError } = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('id', 'valentine-2026')
            .single();

        if (eventError || !event) {
            console.error('❌ Event not found:', eventError);
            return NextResponse.json({
                success: false,
                error: 'Event "valentine-2026" not found',
                hint: 'Run the SQL migration to create the event',
                sql: `
INSERT INTO events (id, name, registration_deadline, draw_date, event_date, status)
VALUES (
    'valentine-2026',
    'Valentine Exchange 2026',
    '2026-12-31 23:59:59+00',
    '2027-01-01 00:00:00+00',
    '2027-02-14 00:00:00+00',
    'REGISTRATION_OPEN'
);
                `.trim(),
            }, { status: 404 });
        }

        // Test 3: Check if registration is open
        const now = new Date();
        const deadline = new Date(event.registration_deadline);
        const isOpen = now < deadline && event.status === 'REGISTRATION_OPEN';

        console.log('✅ Database connection successful!');
        console.log('📅 Event details:', event);

        return NextResponse.json({
            success: true,
            message: 'Database connection successful!',
            event: {
                id: event.id,
                name: event.name,
                status: event.status,
                registration_deadline: event.registration_deadline,
                draw_date: event.draw_date,
                event_date: event.event_date,
            },
            registration: {
                is_open: isOpen,
                current_time: now.toISOString(),
                deadline: event.registration_deadline,
                time_remaining: isOpen ? `${Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days` : 'Closed',
            },
        });
    } catch (error: any) {
        console.error('❌ Test failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Test failed',
            details: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
