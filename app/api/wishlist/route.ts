import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                createErrorResponse('SERVER_ERROR', 'User ID required'),
                { status: 400 }
            );
        }

        const { data: items, error } = await supabaseAdmin
            .from('wishlist_items')
            .select('*')
            .eq('user_id', userId)
            .order('display_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json(createSuccessResponse({ items }));
    } catch (error) {
        console.error('Get wishlist error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}

// POST /api/wishlist - Add wishlist item
export async function POST(request: NextRequest) {
    try {
        const { name, description, link, icon } = await request.json();

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

        // Check item limit
        const { count } = await supabaseAdmin
            .from('wishlist_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (count && count >= 10) {
            return NextResponse.json(
                createErrorResponse('WISHLIST_ITEM_LIMIT'),
                { status: 400 }
            );
        }

        // Add item
        const { data: item, error } = await supabaseAdmin
            .from('wishlist_items')
            .insert({
                user_id: user.id,
                name,
                description,
                link,
                icon,
                display_order: count || 0,
            } as any)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(createSuccessResponse({ item }));
    } catch (error) {
        console.error('Add wishlist item error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}

// DELETE /api/wishlist - Delete wishlist item
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return NextResponse.json(
                createErrorResponse('SERVER_ERROR', 'Item ID required'),
                { status: 400 }
            );
        }

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

        const { error } = await supabaseAdmin
            .from('wishlist_items')
            .delete()
            .eq('id', itemId)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json(createSuccessResponse({ success: true }));
    } catch (error) {
        console.error('Delete wishlist item error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
