"use client";

import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { Edit2, Share2, Gift, Copy, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Participant {
    id: string;
    name: string;
    avatar_url: string | null;
}

interface EventData {
    id: string;
    draw_date: string;
    status: string;
    participant_count: number;
}

export default function HomePage() {
    const { user } = useUser();
    const [isCountdownComplete, setIsCountdownComplete] = useState(false);
    const [event, setEvent] = useState<EventData | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEventData();
        fetchParticipants();
    }, []);

    const fetchEventData = async () => {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", "valentine-2026")
                .single();

            if (error) throw error;
            setEvent(data);

            // Check if countdown is complete
            const drawDate = new Date(data.draw_date);
            const now = new Date();
            setIsCountdownComplete(now >= drawDate || data.status === "DRAW_LIVE");
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async () => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("id, name, avatar_url")
                .eq("profile_complete", true)
                .limit(24);

            if (error) throw error;
            setParticipants(data || []);
        } catch (error) {
            console.error("Error fetching participants:", error);
        }
    };

    const generateInviteCode = async () => {
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch("/api/invite/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (result.success) {
                setInviteCode(result.data.inviteCode);
                setShowInviteModal(true);
            } else {
                toast.error("Failed to generate invite code");
            }
        } catch (error) {
            console.error("Error generating invite:", error);
            toast.error("Failed to generate invite code");
        }
    };

    const copyInviteLink = () => {
        const inviteUrl = `${window.location.origin}/signup?invite=${inviteCode}`;
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        toast.success("Invite link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent selection:bg-primary/20 pb-12">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 space-y-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-6"
                >
                    <Link href="/profile-setup">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-[3px] border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-105 active:scale-95 bg-secondary flex items-center justify-center">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-primary text-3xl font-black">
                                        {user?.name?.charAt(0) || "V"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                    <div className="flex flex-col">
                        <p className="text-xs md:text-sm font-black text-muted-foreground uppercase tracking-[0.2em] -mb-2 opacity-70">
                            Welcome Back
                        </p>
                        <h1 className="text-2xl md:text-3xl -mb-2 font-black flex items-center gap-1 tracking-tighter text-foreground">
                            Hi, {user?.name || "Friend"}!{" "}
                            <motion.span
                                animate={{ rotate: [0, 20, 0] }}
                                transition={{ repeat: Infinity, repeatDelay: 3, duration: 1 }}
                                className="text-4xl md:text-5xl origin-bottom-right inline-block"
                            >
                                👋
                            </motion.span>
                        </h1>
                    </div>
                </motion.div>

                {/* Countdown */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center space-y-6"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1">The Gifting Reveal</h2>
                        <p className="text-muted-foreground text-sm font-medium">
                            Names will be drawn on Valentine's Day
                        </p>
                    </div>
                    <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-sm inline-block w-full max-w-3xl">
                        {!isCountdownComplete && event ? (
                            <CountdownTimer
                                targetDate={new Date(event.draw_date)}
                                onComplete={() => setIsCountdownComplete(true)}
                            />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-6">
                                    It's Time!
                                </p>
                                <Link href="/live-picker">
                                    <Button
                                        size="lg"
                                        className="h-16 text-lg font-bold rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] px-12"
                                    >
                                        Pick Your Val
                                    </Button>
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Profile Preview */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                        <h3 className="font-bold text-lg">Your Profile Preview</h3>
                    </div>

                    <Card className="p-6 md:p-8 bg-card/60 backdrop-blur-md border-border/60 hover:border-primary/20 transition-all duration-500 group">
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                    Self Description
                                </p>
                                <p className="text-lg italic text-foreground/80 leading-relaxed font-medium">
                                    "{user?.bio || "No description yet... Edit your profile to add one."}"
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                    Your Wishlist
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {user?.wishlist && user.wishlist.length > 0 ? (
                                        user.wishlist.map((item: any, i: number) => (
                                            <Badge
                                                key={i}
                                                variant="secondary"
                                                className="pl-3 pr-4 py-2.5 text-sm rounded-2xl bg-secondary/40 border border-secondary/50 hover:bg-secondary transition-colors group-hover:scale-105 duration-300"
                                                style={{ transitionDelay: `${i * 50}ms` }}
                                            >
                                                <div className="bg-background/80 rounded-full p-1.5 mr-2.5">
                                                    <Gift className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                {item.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm italic">No wishlist items yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.section>

                {/* Love Pool */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">
                                The Love Pool ({participants.length} Friends)
                            </h3>
                        </div>
                        <Badge variant="live" className="px-3 py-1 font-bold tracking-wider text-[10px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse"></div>
                            LIVE
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6 justify-items-center">
                        {participants.map((participant, i) => (
                            <motion.div
                                key={participant.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 + 0.3 }}
                                className="flex flex-col items-center gap-3 group cursor-pointer w-full"
                            >
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-background shadow-md group-hover:scale-110 group-hover:border-primary transition-all duration-300 ring ring-transparent group-hover:ring-4 group-hover:ring-primary/10">
                                    {participant.avatar_url ? (
                                        <img
                                            src={participant.avatar_url}
                                            alt={participant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                            {participant.name?.charAt(0) || "?"}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                                    {participant.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    <Button
                        size="lg"
                        fullWidth
                        className="mt-12 h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 gap-2 hover:scale-[1.01] transition-all"
                        onClick={generateInviteCode}
                    >
                        <Share2 className="w-5 h-5" />
                        Invite More Friends
                    </Button>

                    <div className="mt-8 flex justify-center text-[10px] text-muted-foreground uppercase tracking-[0.25em] opacity-30 font-bold">
                        PickingDay.com/V-Day-2026
                    </div>
                </motion.section>
            </main>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card p-8 rounded-3xl max-w-md w-full shadow-2xl"
                    >
                        <h3 className="text-2xl font-bold mb-4">Invite Friends</h3>
                        <p className="text-muted-foreground mb-6">
                            Share this code or link with your friends to join the Valentine Exchange!
                        </p>

                        <div className="bg-background p-4 rounded-2xl mb-4 text-center">
                            <p className="text-xs text-muted-foreground mb-2">Invite Code</p>
                            <p className="text-3xl font-bold tracking-wider text-primary">{inviteCode}</p>
                        </div>

                        <Button
                            fullWidth
                            onClick={copyInviteLink}
                            className="mb-4 h-12 rounded-2xl"
                            variant={copied ? "secondary" : "primary"}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Invite Link
                                </>
                            )}
                        </Button>

                        <Button
                            fullWidth
                            variant="outline"
                            onClick={() => setShowInviteModal(false)}
                            className="h-12 rounded-2xl"
                        >
                            Close
                        </Button>
                    </motion.div>
                </div>
            )}

            <Footer />
        </div>
    );
}
