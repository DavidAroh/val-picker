// Shared state for gift assignments
// This ensures both the pick endpoint and admin view access the same data

export const PARTICIPANTS = [
  'Kelvin',
  'Amara',
  'Zara',
  'Javier',
  'Elena',
  'Marcus',
  'Sophie',
  'Aiden',
]

export interface GiftState {
  assignments: Map<string, string>
  revealedUsers: Set<string>
  generationTime: Date
}

// Global state - persists for the lifetime of the server
let globalState: GiftState | null = null

// Function to generate a derangement (no one gets themselves)
function generateDerangement(names: string[]): { [key: string]: string } {
  const shuffled = [...names]
  let valid = false
  let attempts = 0

  while (!valid && attempts < 100) {
    // Shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Check if valid (no one gets themselves)
    valid = shuffled.every((name, index) => name !== names[index])
    attempts++
  }

  if (!valid) {
    throw new Error('Failed to generate valid derangement')
  }

  const result: { [key: string]: string } = {}
  names.forEach((name, index) => {
    result[name.toLowerCase()] = shuffled[index]
  })
  return result
}

// Initialize the global state if not already done
export function ensureInitialized(): GiftState {
  if (globalState === null) {
    const assignmentMap = new Map(
      Object.entries(generateDerangement(PARTICIPANTS))
    )
    globalState = {
      assignments: assignmentMap,
      revealedUsers: new Set(),
      generationTime: new Date(),
    }
  }
  return globalState
}

// Get current state without initializing
export function getState(): GiftState | null {
  return globalState
}

// Reset state (useful for testing)
export function resetState(): void {
  globalState = null
}

// Get all assignments as an object (for admin view)
export function getAllAssignments(): {
  [giver: string]: string
} | null {
  if (!globalState) return null
  const result: { [key: string]: string } = {}
  globalState.assignments.forEach((value, key) => {
    result[key] = value
  })
  return result
}

// Get reveal statistics
export function getRevealStats(): {
  totalParticipants: number
  revealedCount: number
  percentRevealed: number
  generationTime: string | null
} | null {
  if (!globalState) return null
  return {
    totalParticipants: PARTICIPANTS.length,
    revealedCount: globalState.revealedUsers.size,
    percentRevealed: Math.round(
      (globalState.revealedUsers.size / PARTICIPANTS.length) * 100
    ),
    generationTime: globalState.generationTime.toISOString(),
  }
}
