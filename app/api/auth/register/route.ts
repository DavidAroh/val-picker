import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const { email, password, name, inviteCode } = await request.json();

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                createErrorResponse('INVALID_CREDENTIALS'),
                { status: 400 }
            );
        }

        // Check if registration is open
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('status, registration_deadline')
            .eq('id', 'valentine-2026')
            .single();

        if (!event || event.status !== 'REGISTRATION_OPEN') {
            return NextResponse.json(
                createErrorResponse('REGISTRATION_CLOSED'),
                { status: 403 }
            );
        }

        // Check registration deadline
        const now = new Date();
        const deadline = new Date(event.registration_deadline);
        if (now > deadline) {
            return NextResponse.json(
                createErrorResponse('REGISTRATION_CLOSED'),
                { status: 403 }
            );
        }

        // Validate invite code if provided
        if (inviteCode) {
            const { data: invitation } = await supabaseAdmin
                .from('invitations')
                .select('*')
                .eq('invite_code', inviteCode)
                .is('accepted_by', null)
                .single();

            if (!invitation) {
                return NextResponse.json(
                    createErrorResponse('INVALID_INVITE_CODE'),
                    { status: 400 }
                );
            }
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for demo purposes
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                return NextResponse.json(
                    createErrorResponse('EMAIL_ALREADY_EXISTS'),
                    { status: 409 }
                );
            }
            throw authError;
        }

        // Create user profile
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name: name || email.split('@')[0],
                profile_complete: false,
            })
            .select()
            .single();

        if (userError) throw userError;

        // If invite code was used, update invitation
        if (inviteCode) {
            await supabaseAdmin
                .from('invitations')
                .update({
                    accepted_by: authData.user.id,
                    accepted_at: new Date().toISOString(),
                })
                .eq('invite_code', inviteCode);

            // Create notification for new user
            await supabaseAdmin.from("notifications").insert({
                user_id: user.id,
                type: "WELCOME",
                title: "Welcome to Valentine Exchange!",
                message: "Complete your profile to participate in the draw.",
                data: { event_id: 'valentine-2026' },
            });

            // Send welcome email
            try {
                const { sendWelcomeEmail } = await import("@/lib/email/notifications");
                await sendWelcomeEmail(email, name);
            } catch (emailError) {
                console.error("Failed to send welcome email:", emailError);
                // Don't fail registration if email fails
            }

            // If invited by someone, notify them
            if (invitation.inviter_id) {
                await supabaseAdmin.from("notifications").insert({
                    user_id: invitation.inviter_id,
                    type: "FRIEND_JOINED",
                    title: "Friend Joined!",
                    message: `${user.name} joined using your invite code!`,
                    data: { friend_id: user.id, friend_name: user.name },
                });

                // Send friend joined email
                try {
                    const { sendFriendJoinedEmail } = await import("@/lib/email/notifications");
                    const { data: inviter } = await supabaseAdmin
                        .from("users")
                        .select("email, name")
                        .eq("id", invitation.inviter_id)
                        .single();

                    if (inviter) {
                        await sendFriendJoinedEmail(inviter.email, inviter.name, user.name);
                    }
                } catch (emailError) {
                    console.error("Failed to send friend joined email:", emailError);
                }
            }
        }

        // Log activity
        await supabaseAdmin.from('activity_logs').insert({
            user_id: authData.user.id,
            action: 'USER_REGISTERED',
            event_id: 'valentine-2026',
            metadata: { invite_code: inviteCode || null },
        });

        return NextResponse.json(
            createSuccessResponse({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    profile_complete: user.profile_complete,
                },
            })
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR', error),
            { status: 500 }
        );
    }
}
