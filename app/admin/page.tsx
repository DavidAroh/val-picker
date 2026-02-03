"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Users, Play, Shield } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Match {
    giver_id: string;
    receiver_id: string;
    revealed_at: string | null;
    giver: { name: string; email: string };
    receiver: { name: string; email: string };
}

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch event
            const { data: eventData } = await supabase
                .from("events")
                .select("*")
                .eq("id", "valentine-2026")
                .single();
            setEvent(eventData);

            // Fetch participants
            const { data: users } = await supabase
                .from("users")
                .select("id, name, email, profile_complete")
                .eq("profile_complete", true);
            setParticipants(users || []);

            // Fetch matches
            const { data: matchData } = await supabase
                .from("matches")
                .select(`
          giver_id,
          receiver_id,
          revealed_at,
          giver:users!matches_giver_id_fkey (name, email),
          receiver:users!matches_receiver_id_fkey (name, email)
        `)
                .eq("event_id", "valentine-2026");
            setMatches(matchData || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateMatches = async () => {
        if (generating) return;

        if (participants.length < 2) {
            toast.error("Need at least 2 participants with complete profiles");
            return;
        }

        if (confirm(`Generate matches for ${participants.length} participants?`)) {
            setGenerating(true);
            try {
                const session = await supabase.auth.getSession();
                const token = session.data.session?.access_token;

                const response = await fetch("/api/match/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ eventId: "valentine-2026" }),
                });

                const result = await response.json();
                if (result.success) {
                    toast.success("Matches generated successfully!");
                    fetchData();
                } else {
                    toast.error(result.error?.message || "Failed to generate matches");
                }
            } catch (error) {
                console.error("Error generating matches:", error);
                toast.error("Failed to generate matches");
            } finally {
                setGenerating(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent pb-12">
            <Navbar />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/home">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                            <p className="text-sm text-muted-foreground">Valentine Exchange 2026</p>
                        </div>
                    </div>
                    <Badge variant="live" className="px-3 py-1.5">
                        <Shield className="w-3 h-3 mr-2" />
                        ADMIN
                    </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{participants.length}</p>
                                <p className="text-sm text-muted-foreground">Participants</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                                <Play className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{matches.length}</p>
                                <p className="text-sm text-muted-foreground">Matches Generated</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {matches.filter((m) => m.revealed_at).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Revealed</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Actions */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4">Actions</h2>
                    <div className="flex gap-4">
                        <Button
                            onClick={generateMatches}
                            disabled={generating || matches.length > 0}
                            className="h-12"
                        >
                            {generating ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                    Generating...
                                </span>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Generate Matches
                                </>
                            )}
                        </Button>
                        {matches.length > 0 && (
                            <Badge variant="secondary" className="px-3 py-2">
                                Matches already generated
                            </Badge>
                        )}
                    </div>
                </Card>

                {/* Participants List */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4">Participants ({participants.length})</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {participants.map((participant) => (
                            <div
                                key={participant.id}
                                className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                            >
                                <div>
                                    <p className="font-semibold">{participant.name}</p>
                                    <p className="text-sm text-muted-foreground">{participant.email}</p>
                                </div>
                                <Badge variant="secondary">Complete</Badge>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Matches List */}
                {matches.length > 0 && (
                    <Card className="p-6">
                        <h2 className="text-lg font-bold mb-4">Matches ({matches.length})</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {matches.map((match, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-semibold">{match.giver.name}</p>
                                            <p className="text-xs text-muted-foreground">{match.giver.email}</p>
                                        </div>
                                        <span className="text-primary">→</span>
                                        <div>
                                            <p className="font-semibold">{match.receiver.name}</p>
                                            <p className="text-xs text-muted-foreground">{match.receiver.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant={match.revealed_at ? "default" : "secondary"}>
                                        {match.revealed_at ? "Revealed" : "Pending"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
}
