"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { generateValentineMatches, Assignment, Participant } from "@/lib/matching";
import { useUser } from "./UserContext";

interface MatchContextType {
    assignments: Assignment[];
    myMatch: Participant | null;
    isLive: boolean; // Is the event currently "Live" (drawing phase)
    hasDrawn: boolean; // Has the current user revealed their match?
    triggerDraw: () => void; // Admin function to start the draw
    revealMyMatch: () => void; // User function to see their match
    participants: Participant[];
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLive, setIsLive] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [myMatch, setMyMatch] = useState<Participant | null>(null);

    // Mock participants (including the current user if registered)
    // In a real app, this would come from the DB
    const [participants, setParticipants] = useState<Participant[]>([
        { id: "u1", name: "Marcus", email: "marcus@example.com", avatar: "https://i.pravatar.cc/150?u=marcus" },
        { id: "u2", name: "Elena", email: "elena@example.com", avatar: "https://i.pravatar.cc/150?u=elena" },
        { id: "u3", name: "Jordan", email: "jordan@example.com" },
        { id: "u4", name: "Maya", email: "maya@example.com", avatar: "https://i.pravatar.cc/150?u=maya" },
        { id: "u5", name: "Liam", email: "liam@example.com", avatar: "https://i.pravatar.cc/150?u=liam" },
        { id: "u6", name: "Sofia", email: "sofia@example.com", avatar: "https://i.pravatar.cc/150?u=sofia" },
        { id: "u7", name: "Alex", email: "alex@example.com", avatar: "https://i.pravatar.cc/150?u=alex" },
        { id: "u8", name: "Tom", email: "tom@example.com", avatar: "https://i.pravatar.cc/150?u=tom" },
    ]);

    // Load state from local storage - DISABLED FOR TESTING
    // useEffect(() => {
    //     const savedAssignments = localStorage.getItem("valentine_assignments");
    //     const savedIsLive = localStorage.getItem("valentine_islive");
    //     const savedHasDrawn = localStorage.getItem("valentine_hasdrawn");

    //     if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    //     if (savedIsLive === "true") setIsLive(true);
    //     if (savedHasDrawn === "true") setHasDrawn(true);
    // }, []);

    // Sync user to participants list if registered
    useEffect(() => {
        if (user && user.isRegistered) {
            // In a real app we'd have a stable ID. Here we mock it or use email.
            // For simplicity, let's assume the user IS one of the mock users or we append them.
            // Let's append if not found.
            setParticipants(prev => {
                if (prev.find(p => p.email === user.email)) return prev;
                return [...prev, { id: "current-user", name: user.name, email: user.email }];
            });
        }
    }, [user]);

    // Calculate my match whenever assignments change or user changes
    useEffect(() => {
        if (!user || assignments.length === 0) return;

        // Find assignment where giver is me
        // Assuming current user has id "current-user" or we match by email/name for this mock
        const myId = "current-user"; // simplify for demo
        const assignment = assignments.find(a => a.giverId === myId) || assignments.find(a => a.giverId === user.email);

        if (assignment) {
            const match = participants.find(p => p.id === assignment.receiverId);
            setMyMatch(match || null);
        }
    }, [assignments, user, participants]);


    const triggerDraw = () => {
        // Determine all participants
        // Ensure we have enough
        const currentParticipants = [...participants];

        // If not included, add current user for the draw
        if (user && user.isRegistered && !currentParticipants.find(p => p.email === user.email)) {
            currentParticipants.push({ id: "current-user", name: user.name, email: user.email });
        }

        try {
            const newAssignments = generateValentineMatches(currentParticipants);
            setAssignments(newAssignments);
            setIsLive(true);

            // localStorage.setItem("valentine_assignments", JSON.stringify(newAssignments));
            // localStorage.setItem("valentine_islive", "true");
        } catch (e) {
            console.error("Failed to generate matches", e);
            alert("Not enough participants to draw!");
        }
    };

    const revealMyMatch = () => {
        setHasDrawn(true);
        // localStorage.setItem("valentine_hasdrawn", "true");
    };

    return (
        <MatchContext.Provider value={{
            assignments,
            myMatch,
            isLive,
            hasDrawn,
            triggerDraw,
            revealMyMatch,
            participants
        }}>
            {children}
        </MatchContext.Provider>
    );
}

export const useMatch = () => {
    const context = useContext(MatchContext);
    if (!context) throw new Error("useMatch must be used within MatchProvider");
    return context;
};
