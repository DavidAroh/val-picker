"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Info } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LivePickerPage() {
    const { user } = useUser();
    const router = useRouter();
    const [isRevealing, setIsRevealing] = useState(false);
    const [revealsCount, setRevealsCount] = useState(0);
    const [matchStatus, setMatchStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkMatchStatus();
        fetchRevealsCount();
    }, []);

    const checkMatchStatus = async () => {
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch("/api/match/status?eventId=valentine-2026", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (result.success) {
                setMatchStatus(result.data);

                // If already revealed, redirect
                if (result.data.revealed) {
                    router.push("/match-reveal");
                }
            }
        } catch (error) {
            console.error("Error checking match status:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRevealsCount = async () => {
        try {
            const { count } = await supabase
                .from("matches")
                .select("*", { count: "exact", head: true })
                .eq("event_id", "valentine-2026")
                .not("revealed_at", "is", null);

            setRevealsCount(count || 0);
        } catch (error) {
            console.error("Error fetching reveals count:", error);
        }
    };

    const handleDraw = async () => {
        if (!matchStatus?.assigned) {
            toast.error("Matches haven't been generated yet!");
            return;
        }

        setIsRevealing(true);

        // Confetti animation
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#E31B23", "#FF85A2", "#FFF"],
        });

        // Reveal match via API
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch("/api/match/reveal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ eventId: "valentine-2026" }),
            });

            const result = await response.json();

            if (result.success) {
                // Store match data for reveal page
                sessionStorage.setItem("revealedMatch", JSON.stringify(result.data.match));

                setTimeout(() => {
                    router.push("/match-reveal");
                }, 2000);
            } else {
                toast.error(result.error?.message || "Failed to reveal match");
                setIsRevealing(false);
            }
        } catch (error) {
            console.error("Error revealing match:", error);
            toast.error("Failed to reveal match");
            setIsRevealing(false);
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
        <div className="min-h-screen flex flex-col bg-transparent text-foreground overflow-hidden relative">
            <nav className="relative z-10 p-6 flex items-center justify-between">
                <Link href="/home">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        Back
                    </Button>
                </Link>
                <div className="flex flex-col items-center">
                    <span className="font-bold tracking-widest uppercase text-xs text-muted-foreground/40">
                        Valentine 2026
                    </span>
                    <span className="font-bold text-lg text-foreground">Live Picker</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground rounded-full"
                >
                    <Info className="w-5 h-5" />
                </Button>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-md mx-auto">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <Badge
                        variant="live"
                        className="px-4 py-2 text-xs font-bold tracking-widest shadow-lg"
                    >
                        <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></div>
                        DRAW IS LIVE
                    </Badge>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        Ready to meet your
                        <br />
                        <span className="text-primary">Secret Valentine?</span>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
                        Click the button below to reveal who you'll be gifting to this Valentine's Day
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full space-y-6"
                >
                    <Button
                        size="lg"
                        fullWidth
                        onClick={handleDraw}
                        disabled={isRevealing || !matchStatus?.assigned}
                        className="h-16 text-xl font-bold rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isRevealing ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                Revealing...
                            </span>
                        ) : (
                            "Draw My Valentine 💘"
                        )}
                    </Button>

                    {!matchStatus?.assigned && (
                        <p className="text-center text-sm text-destructive">
                            Matches haven't been generated yet. Check back soon!
                        </p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 text-center"
                >
                    <p className="text-xs text-muted-foreground mb-2">Social Proof</p>
                    <p className="text-2xl font-bold text-primary">
                        {revealsCount} {revealsCount === 1 ? "person has" : "people have"} already drawn
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-auto pt-12 text-center space-y-4"
                >
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span>Anonymous & Secure</span>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
