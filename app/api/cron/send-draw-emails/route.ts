import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendDrawDayEmail } from "@/lib/email/notifications";
import { createSuccessResponse, createErrorResponse } from "@/lib/errors";

/**
 * Cron job endpoint to send draw day email notifications
 * This should be triggered on Valentine's Day (or configured draw date)
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-draw-emails",
 *     "schedule": "0 0 8 2 *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
    try {
        // Verify this is a cron request (Vercel adds this header)
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                createErrorResponse('UNAUTHORIZED'),
                { status: 401 }
            );
        }

        // Get all users with complete profiles
        const { data: users, error: usersError } = await supabaseAdmin
            .from("users")
            .select("id, email, name")
            .eq("profile_complete", true) as { data: any[]; error: any };

        if (usersError) throw usersError;

        if (!users || users.length === 0) {
            return NextResponse.json(
                createSuccessResponse({ message: "No users to notify", count: 0 })
            );
        }

        // Send emails to all users
        const emailPromises = users.map((user) =>
            sendDrawDayEmail(user.email, user.name)
        );

        const results = await Promise.allSettled(emailPromises);

        const successCount = results.filter((r) => r.status === "fulfilled").length;
        const failureCount = results.filter((r) => r.status === "rejected").length;

        // Log activity
        await supabaseAdmin.from("activity_logs").insert({
            event_id: "valentine-2026",
            action: "DRAW_DAY_EMAILS_SENT",
            metadata: {
                total: users.length,
                success: successCount,
                failed: failureCount,
            },
        } as any);

        return NextResponse.json(
            createSuccessResponse({
                message: "Draw day emails sent",
                total: users.length,
                success: successCount,
                failed: failureCount,
            })
        );
    } catch (error) {
        console.error("Error sending draw day emails:", error);
        return NextResponse.json(
            createErrorResponse('SERVER_ERROR'),
            { status: 500 }
        );
    }
}
