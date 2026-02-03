import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

export async function GET(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    try {
        const eventId = params.eventId;

        // Get all participants who have been assigned
        const { data: participants, error } = await supabaseAdmin
            .from('matches')
            .select(`
        giver:users!matches_giver_id_fkey (
          id,
          name,
          avatar_url
        ),
        receiver:users!matches_receiver_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
            .eq('event_id', eventId);

        if (error) throw error;

        // Deduplicate participants
        const uniqueParticipants = new Map();

        participants?.forEach((match: any) => {
            if (match.giver) {
                uniqueParticipants.set(match.giver.id, match.giver);
            }
            if (match.receiver) {
                uniqueParticipants.set(match.receiver.id, match.receiver);
            }
        });

        const participantList = Array.from(uniqueParticipants.values());

        return NextResponse.json(
            createSuccessResponse({
                participants: participantList,
                count: participantList.length,
            })
        );
    } catch (error) {
        console.error('Get participants error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
