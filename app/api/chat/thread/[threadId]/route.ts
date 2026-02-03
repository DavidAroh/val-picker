import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

export async function GET(
    request: NextRequest,
    { params }: { params: { threadId: string } }
) {
    try {
        const threadId = params.threadId;

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

        // Verify user has access to this thread
        const { data: thread, error: threadError } = await supabaseAdmin
            .from('chat_threads')
            .select(`
        id,
        match_id,
        matches!inner (
          giver_id,
          receiver_id
        )
      `)
            .eq('id', threadId)
            .single();

        if (threadError || !thread) {
            return NextResponse.json(
                createErrorResponse('THREAD_NOT_FOUND'),
                { status: 404 }
            );
        }

        // Type the nested match data properly
        type ThreadWithMatch = {
            id: string;
            match_id: string;
            matches: {
                giver_id: string;
                receiver_id: string;
            } | null;
        };

        const typedThread = thread as unknown as ThreadWithMatch;

        if (!typedThread.matches ||
            (typedThread.matches.giver_id !== user.id && typedThread.matches.receiver_id !== user.id)) {
            return NextResponse.json(
                createErrorResponse('UNAUTHORIZED_THREAD'),
                { status: 403 }
            );
        }

        // Get messages
        const { data: messages, error } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('thread_id', threadId)
            .order('sent_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json(
            createSuccessResponse({
                thread,
                messages,
            })
        );
    } catch (error) {
        console.error('Get chat thread error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
