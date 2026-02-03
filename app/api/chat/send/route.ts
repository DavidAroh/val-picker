import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const { threadId, message } = await request.json();

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

        // Validate message
        if (!message || message.trim().length === 0) {
            return NextResponse.json(
                createErrorResponse('SERVER_ERROR', 'Message cannot be empty'),
                { status: 400 }
            );
        }

        if (message.length > 1000) {
            return NextResponse.json(
                createErrorResponse('MESSAGE_TOO_LONG'),
                { status: 400 }
            );
        }

        // Verify user has access to this thread
        const { data: thread } = await supabaseAdmin
            .from('chat_threads')
            .select(`
        id,
        match:matches (
          id,
          giver_id,
          receiver_id
        )
      `)
            .eq('id', threadId)
            .single();

        if (!thread ||
            (thread.match.giver_id !== user.id && thread.match.receiver_id !== user.id)) {
            return NextResponse.json(
                createErrorResponse('UNAUTHORIZED_THREAD'),
                { status: 403 }
            );
        }

        // Insert message
        const { data: newMessage, error } = await supabaseAdmin
            .from('messages')
            .insert({
                thread_id: threadId,
                sender_id: user.id,
                message_text: message,
            })
            .select()
            .single();

        if (error) throw error;

        // Update thread last message time
        await supabaseAdmin
            .from('chat_threads')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', threadId);

        // Get receiver ID and create notification
        const receiverId = thread.match.giver_id === user.id
            ? thread.match.receiver_id
            : thread.match.giver_id;

        // Create in-app notification for recipient
        await supabaseAdmin.from('notifications').insert({
            user_id: receiverId,
            type: 'NEW_MESSAGE',
            title: 'New message from your Valentine',
            message: 'You have a new message in your anonymous chat',
            action_url: `/chat?threadId=${threadId}`,
            data: {
                thread_id: threadId,
                sender_id: user.id,
            },
        });

        // Send email notification to recipient
        try {
            const { sendNewMessageEmail } = await import("@/lib/email/notifications");
            const { data: recipient } = await supabaseAdmin
                .from("users")
                .select("email, name")
                .eq("id", receiverId)
                .single();

            if (recipient) {
                await sendNewMessageEmail(recipient.email, recipient.name);
            }
        } catch (emailError) {
            console.error("Failed to send new message email:", emailError);
            // Don't fail message send if email fails
        }

        return NextResponse.json(createSuccessResponse({ message: newMessage }));
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
