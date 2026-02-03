export interface Participant {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Assignment {
    giverId: string;
    receiverId: string;
    assignedAt: Date;
}

/**
 * Generate random Secret Valentine assignments
 * Ensures: no self-picks, no duplicate receivers, fully random
 */
export function generateValentineMatches(participants: Participant[]): Assignment[] {
    const n = participants.length;

    if (n < 2) {
        throw new Error('Need at least 2 participants for matching');
    }

    // Create a shuffled array of indices representing receivers
    // receivers[i] means participants[i] gives to participants[receiver[i]]
    let receivers = [...Array(n).keys()];
    let isValidDerangement = false;
    let attempts = 0;
    const maxAttempts = 1000;

    // Keep shuffling until we get a valid derangement
    while (!isValidDerangement && attempts < maxAttempts) {
        // Fisher-Yates shuffle
        for (let i = receivers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
        }

        // Check if this is a valid derangement (no one picks themselves)
        // In our receiver array, index is giver, value is receiver.
        // So if receivers[i] == i, then i gives to i (self-match), which is invalid.
        isValidDerangement = receivers.every((receiverIdx, giverIdx) =>
            receiverIdx !== giverIdx
        );

        attempts++;
    }

    if (!isValidDerangement) {
        // Fallback: use cycle-based derangement which is guaranteed to be valid
        console.warn("Falling back to cycle derangement after max attempts");
        receivers = generateCycleDerangement(n);
    }

    // Create assignments
    const assignments: Assignment[] = participants.map((giver, index) => ({
        giverId: giver.id,
        receiverId: participants[receivers[index]].id,
        assignedAt: new Date()
    }));

    return assignments;
}

/**
 * Guaranteed derangement using cycle approach
 * Creates a cycle: 0->1->2->...->n-1->0
 * Then randomizes the mapping by shuffling the participants beforehand effectively
 */
function generateCycleDerangement(n: number): number[] {
    // We want to map giver I to receiver R such that I != R.
    // One way is to shuffle the people, then link them in a circle.
    // However, our input 'receivers' array implies: index=giver, value=receiver.

    // Create random mapping of indices
    const indices = [...Array(n).keys()];

    // Fisher-Yates shuffle used to randomize the order in the cycle
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Create cycle: each person gives to the next in shuffled order.
    // If shuffled order is [A, B, C], then A->B, B->C, C->A.
    const receivers = new Array(n);
    for (let i = 0; i < n; i++) {
        const giver = indices[i];
        const receiver = indices[(i + 1) % n]; // Wrap around at the end
        receivers[giver] = receiver;
    }

    return receivers;
}
