import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createSuccessResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        await supabase.auth.signOut();

        return NextResponse.json(
            createSuccessResponse({ message: 'Logged out successfully' })
        );
    } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, we can still return success
        // because the client will clear the session
        return NextResponse.json(
            createSuccessResponse({ message: 'Logged out' })
        );
    }
}
