import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
    try {
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

        // Get user's notifications
        const { data: notifications, error } = await supabaseAdmin
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Get unread count
        const { count: unreadCount } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('read', false);

        return NextResponse.json(
            createSuccessResponse({
                notifications,
                unreadCount: unreadCount || 0,
            })
        );
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
