"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Lock, Eye } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function MatchRevealPage() {
    const router = useRouter();
    const [matchData, setMatchData] = useState<any>(null);

    useEffect(() => {
        // Get match data from sessionStorage
        const storedMatch = sessionStorage.getItem("revealedMatch");
        if (!storedMatch) {
            router.push("/live-picker");
            return;
        }

        setMatchData(JSON.parse(storedMatch));

        // Confetti animation
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);

        return () => clearInterval(interval);
    }, [router]);

    if (!matchData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-foreground selection:bg-primary/30">
            <nav className="p-6 flex items-center justify-center relative z-10">
                <div className="flex flex-col items-center">
                    <span className="font-bold tracking-widest uppercase text-xs text-muted-foreground/40">
                        Valentine 2026
                    </span>
                    <span className="font-bold text-lg text-foreground">Live Picker</span>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto text-center space-y-10">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex justify-center"
                >
                    <Badge
                        variant="confidential"
                        className="border-amber-500/30 text-amber-500 bg-amber-500/10 px-4 py-1.5 tracking-widest text-[10px] font-bold"
                    >
                        <Lock className="w-3 h-3 mr-2" />
                        CONFIDENTIAL REVEAL
                    </Badge>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative"
                >
                    <div className="relative">
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-48 h-48 text-primary drop-shadow-[0_0_15px_rgba(227,27,35,0.5)]"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
                            <img
                                src={matchData.valentine?.avatar_url || "https://i.pravatar.cc/150?u=mystery"}
                                alt="Match"
                                className="w-full h-full object-cover opacity-80 blur-sm"
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                >
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        You've got a match!
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        The wait is over. Your target is assigned.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="font-mono text-2xl tracking-[0.5em] text-foreground/80 font-bold"
                >
                    ????????
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="w-full space-y-8"
                >
                    <p className="text-muted-foreground text-sm">
                        Your mission:{" "}
                        <span className="text-primary font-bold">Get to know your Valentine</span>
                    </p>

                    <Link href="/valentine-match" className="block w-full">
                        <Button
                            size="lg"
                            fullWidth
                            className="h-14 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        >
                            View Profile <Eye className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>

                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/20 font-bold">
                        Mission Protocol Activated
                    </p>
                </motion.div>

                {/* Social Proof Footer */}
                <div className="fixed bottom-8 w-full left-0 px-6">
                    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 max-w-sm mx-auto shadow-xl">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <img
                                    key={i}
                                    src={`https://i.pravatar.cc/150?u=${i + 20}`}
                                    className="w-8 h-8 rounded-full border-2 border-card"
                                    alt=""
                                />
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground leading-tight">
                            <span className="text-foreground font-bold">Others</span> have already viewed their
                            secrets
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
