import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
    try {
        // Get user from auth header
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

        // Fetch profile with wishlist
        const { data: profile, error } = await supabaseAdmin
            .from('users')
            .select(`
        *,
        wishlist_items (
          id,
          name,
          description,
          link,
          icon,
          display_order
        )
      `)
            .eq('id', user.id)
            .single();

        if (error) throw error;

        return NextResponse.json(createSuccessResponse(profile));
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const { bio, work, hobbies, name, avatar_url } = await request.json();

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

        // Validate required fields
        if (!bio || !work || !hobbies) {
            return NextResponse.json(
                createErrorResponse('PROFILE_INCOMPLETE'),
                { status: 400 }
            );
        }

        // Update profile
        const { data: profile, error } = await supabaseAdmin
            .from('users')
            .update({
                name,
                bio,
                work,
                hobbies,
                avatar_url,
                profile_complete: true,
            } as any)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        // Log activity
        await supabaseAdmin.from('activity_logs').insert({
            user_id: user.id,
            action: 'PROFILE_UPDATED',
            event_id: 'valentine-2026',
        } as any);

        return NextResponse.json(createSuccessResponse(profile));
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
