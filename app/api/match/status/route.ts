import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId') || 'valentine-2026';

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

        // Get user's match status
        const { data: match } = await supabaseAdmin
            .from('matches')
            .select('id, assigned_at, revealed_at')
            .eq('giver_id', user.id)
            .eq('event_id', eventId)
            .single() as { data: any; error: any };

        // Get total reveal count for social proof
        const { count } = await supabaseAdmin
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .not('revealed_at', 'is', null);

        return NextResponse.json(
            createSuccessResponse({
                assigned: !!match,
                revealed: !!match?.revealed_at,
                revealedAt: match?.revealed_at,
                revealsCount: count || 0,
            })
        );
    } catch (error) {
        console.error('Get match status error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
