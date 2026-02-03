import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;

        // Get event details
        const { data: event, error: eventError } = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (eventError) throw eventError;

        // Calculate countdown
        const now = new Date();
        const drawDate = new Date(event.draw_date);
        const timeDiff = drawDate.getTime() - now.getTime();

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        return NextResponse.json(
            createSuccessResponse({
                event,
                countdown: {
                    days: Math.max(0, days),
                    hours: Math.max(0, hours),
                    minutes: Math.max(0, minutes),
                    seconds: Math.max(0, seconds),
                    isComplete: timeDiff <= 0,
                },
            })
        );
    } catch (error) {
        console.error('Get event error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
