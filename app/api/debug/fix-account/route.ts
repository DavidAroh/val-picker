import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        const results: any = {
            steps: [],
            fixed: false,
        };

        // 1. Check and Fix Event
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('id')
            .eq('id', 'valentine-2026')
            .single();

        if (!event) {
            results.steps.push('❌ Event "valentine-2026" missing. Creating it...');
            const { error: insertError } = await supabaseAdmin.from('events').insert({
                id: 'valentine-2026',
                name: 'Valentine Exchange 2026',
                registration_deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                draw_date: new Date(Date.now() + 172800000).toISOString(),
                event_date: '2026-02-14 00:00:00+00',
                status: 'REGISTRATION_OPEN',
            } as any);

            if (insertError) throw insertError;
            results.steps.push('✅ Event created successfully.');
        } else {
            results.steps.push('✅ Event "valentine-2026" exists.');
        }

        if (!email) {
            return NextResponse.json(createSuccessResponse({
                message: "Event check complete. Provide ?email=... to fix a specific user.",
                results
            }));
        }

        // 2. Fix User
        // Get user from Auth (Admin API)
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        const authUser = users.find(u => u.email === email);

        if (!authUser) {
            return NextResponse.json(createErrorResponse('USER_NOT_FOUND', `No auth user found for email: ${email}`));
        }

        results.steps.push(`✅ Found Auth User: ${authUser.id}`);

        // Check public.users table
        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (!profile) {
            results.steps.push('❌ Profile missing in "users" table. Creating it...');
            const { error: createError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: authUser.id,
                    email: authUser.email!,
                    name: authUser.user_metadata?.name || email.split('@')[0],
                    profile_complete: false,
                } as any);

            if (createError) throw createError;
            results.steps.push('✅ Profile created successfully! You should be able to login now.');
            results.fixed = true;
        } else {
            results.steps.push('✅ Profile exists in "users" table.');
        }

        return NextResponse.json(createSuccessResponse(results));

    } catch (error: any) {
        return NextResponse.json(createErrorResponse('SERVER_ERROR', error.message), { status: 500 });
    }
}
