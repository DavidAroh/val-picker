import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';
import { generateValentineMatches } from '@/lib/matching';

export async function POST(request: NextRequest) {
    try {
        const { eventId = 'valentine-2026' } = await request.json();

        // Get event
        const { data: event, error: eventError } = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (eventError) throw eventError;

        // Check if matches already generated
        if (event.matches_generated_at) {
            return NextResponse.json(
                createErrorResponse('SERVER_ERROR', 'Matches already generated'),
                { status: 400 }
            );
        }

        // Get all users with complete profiles
        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('id, name, email, avatar_url')
            .eq('profile_complete', true);

        if (usersError) throw usersError;

        if (!users || users.length < 2) {
            return NextResponse.json(
                createErrorResponse('SERVER_ERROR', 'Need at least 2 participants'),
                { status: 400 }
            );
        }

        // Generate matches using derangement algorithm
        const participants = users.map(u => ({
            id: u.id,
            name: u.name || u.email,
            email: u.email,
            avatar: u.avatar_url,
        }));

        const assignments = generateValentineMatches(participants);

        // Store matches in database (transaction)
        const matchRecords = assignments.map(assignment => ({
            event_id: eventId,
            giver_id: assignment.giverId,
            receiver_id: assignment.receiverId,
            assigned_at: assignment.assignedAt.toISOString(),
        }));

        const { error: matchError } = await supabaseAdmin
            .from('matches')
            .insert(matchRecords);

        if (matchError) throw matchError;

        // Update event status
        await supabaseAdmin
            .from('events')
            .update({
                status: 'DRAW_LIVE',
                matches_generated_at: new Date().toISOString(),
                participant_count: users.length,
            })
            .eq('id', eventId);

        // Create notifications for all users
        const notifications = users.map(user => ({
            user_id: user.id,
            type: 'DRAW_READY',
            title: "It's time! 💘",
            message: 'Draw your Valentine now!',
            action_url: '/live-picker',
        }));

        await supabaseAdmin.from('notifications').insert(notifications);

        // Log activity
        await supabaseAdmin.from('activity_logs').insert({
            user_id: null,
            action: 'MATCHES_GENERATED',
            event_id: eventId,
            metadata: { participant_count: users.length },
        });

        return NextResponse.json(
            createSuccessResponse({
                message: 'Matches generated successfully',
                participantCount: users.length,
                matchCount: assignments.length,
            })
        );
    } catch (error) {
        console.error('Generate matches error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
