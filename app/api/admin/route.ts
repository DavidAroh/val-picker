import { NextRequest, NextResponse } from 'next/server'
import {
    ensureInitialized,
    getAllAssignments,
    getRevealStats,
    PARTICIPANTS,
} from '@/lib/gift-state'

export async function GET(request: NextRequest) {
    try {
        // Ensure state is initialized
        ensureInitialized()

        const assignments = getAllAssignments()
        const stats = getRevealStats()

        if (!assignments || !stats) {
            return NextResponse.json(
                { error: 'Failed to retrieve assignments' },
                { status: 500 }
            )
        }

        // Format for display
        const formattedAssignments = PARTICIPANTS.map(name => ({
            giver: name,
            receiver: assignments[name.toLowerCase()],
        }))

        return NextResponse.json({
            assignments: formattedAssignments,
            statistics: stats,
            generatedAt: stats.generationTime,
        })
    } catch (error) {
        console.error('Error getting assignments:', error)
        return NextResponse.json(
            { error: 'Failed to retrieve assignments' },
            { status: 500 }
        )
    }
}
