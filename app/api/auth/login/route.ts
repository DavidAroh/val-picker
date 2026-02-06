import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

// Type definition for User
interface User {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    bio: string | null;
    work: string | null;
    hobbies: string | null;
    profile_complete: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                createErrorResponse('INVALID_CREDENTIALS'),
                { status: 400 }
            );
        }

        // Sign in with Supabase Auth
        const { data: authData, error: authError } =
            await supabaseAdmin.auth.signInWithPassword({
                email,
                password,
            });

        if (authError) {
            return NextResponse.json(
                createErrorResponse('INVALID_CREDENTIALS'),
                { status: 401 }
            );
        }

        // Get user profile
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single() as { data: User | null; error: any };

        // Update last login
        await supabaseAdmin
            .from('users')
            // @ts-ignore - Supabase type inference issue
            .update({ last_login: new Date().toISOString() })
            .eq('id', authData.user.id);

        return NextResponse.json(
            createSuccessResponse({
                user: {
                    id: user?.id,
                    email: user?.email,
                    name: user?.name,
                    avatar_url: user?.avatar_url,
                    bio: user?.bio,
                    work: user?.work,
                    hobbies: user?.hobbies,
                    profile_complete: user?.profile_complete,
                },
                session: {
                    access_token: authData.session.access_token,
                    refresh_token: authData.session.refresh_token,
                },
            })
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
