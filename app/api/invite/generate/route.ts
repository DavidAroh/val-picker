import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const { inviteCode } = await request.json();

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

        // Generate unique invite code if not provided
        const code = inviteCode || generateCode();

        // Create invitation
        const { data: invitation, error } = await supabaseAdmin
            .from('invitations')
            .insert({
                inviter_id: user.id,
                invite_code: code,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            })
            .select()
            .single();

        if (error) throw error;

        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${code}`;

        return NextResponse.json(
            createSuccessResponse({
                invitation,
                inviteUrl,
                inviteCode: code,
            })
        );
    } catch (error) {
        console.error('Generate invitation error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}

function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
