import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const { eventId = 'valentine-2026' } = await request.json();

        // Get authenticated user
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                createErrorResponse('UNAUTHORIZED'),
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                createErrorResponse('UNAUTHORIZED'),
                { status: 401 }
            );
        }

        // Check if event is live
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('status')
            .eq('id', eventId)
            .single() as { data: any; error: any };

        if (!event || event.status !== 'DRAW_LIVE') {
            return NextResponse.json(
                createErrorResponse('DRAW_NOT_READY'),
                { status: 400 }
            );
        }

        // Check if already revealed
        const { data: existingMatch } = await supabaseAdmin
            .from('matches')
            .select('revealed_at')
            .eq('giver_id', user.id)
            .eq('event_id', eventId)
            .single() as { data: any; error: any };

        if (existingMatch?.revealed_at) {
            return NextResponse.json(
                createErrorResponse('ALREADY_REVEALED'),
                { status: 400 }
            );
        }

        // Get match assignment
        const { data: match, error: matchError } = await supabaseAdmin
            .from('matches')
            .select(`
        id,
        assigned_at,
        receiver:users!matches_receiver_id_fkey (
          id,
          name,
          email,
          avatar_url,
          bio,
          work,
          hobbies,
          wishlist_items (
            id,
            name,
            description,
            link,
            icon,
            display_order
          )
        )
      `)
            .eq('giver_id', user.id)
            .eq('event_id', eventId)
            .single() as { data: any; error: any };

        if (matchError || !match) {
            return NextResponse.json(
                createErrorResponse('NO_MATCH_ASSIGNED'),
                { status: 404 }
            );
        }

        // Mark as revealed
        await supabaseAdmin
            .from('matches')
            .update({ revealed_at: new Date().toISOString() } as any)
            .eq('id', match.id);

        // Create or get chat thread
        let { data: chatThread } = await supabaseAdmin
            .from('chat_threads')
            .select('id')
            .eq('match_id', match.id)
            .single() as { data: any; error: any };

        if (!chatThread) {
            const { data: newThread } = await supabaseAdmin
                .from('chat_threads')
                .insert({ match_id: match.id } as any)
                .select()
                .single() as { data: any; error: any };
            chatThread = newThread;
        }

        // Log activity
        await supabaseAdmin.from('activity_logs').insert({
            user_id: user.id,
            action: 'MATCH_REVEALED',
            event_id: eventId,
        } as any);

        return NextResponse.json(
            createSuccessResponse({
                match: {
                    id: match.id,
                    valentine: match.receiver,
                    assignedAt: match.assigned_at,
                    chatThreadId: chatThread?.id,
                },
            })
        );
    } catch (error) {
        console.error('Reveal match error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
