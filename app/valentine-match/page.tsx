"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Briefcase, Coffee, Gift, MessageCircle, Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ValentineMatchPage() {
    const router = useRouter();
    const [matchData, setMatchData] = useState<any>(null);

    useEffect(() => {
        // Get match data from sessionStorage
        const storedMatch = sessionStorage.getItem("revealedMatch");
        if (!storedMatch) {
            router.push("/live-picker");
            return;
        }

        const data = JSON.parse(storedMatch);
        setMatchData(data);
    }, [router]);

    if (!matchData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const valentine = matchData.valentine;

    return (
        <div className="min-h-screen flex flex-col bg-transparent pb-12">
            <Navbar />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/home">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            aria-label="Go back home"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Valentine Match</h1>
                </div>

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center space-y-4"
                >
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-background shadow-xl overflow-hidden relative z-10">
                            <img
                                src={valentine?.avatar_url || "https://i.pravatar.cc/150?u=match"}
                                alt={valentine?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <Badge className="absolute -bottom-2 md:bottom-0 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-primary text-white border-4 border-background text-xs">
                            <Heart className="w-3 h-3 mr-1 fill-white" /> Target
                        </Badge>
                    </div>

                    <div>
                        <h2 className="text-3xl font-black tracking-tight">{valentine?.name}</h2>
                        <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            Matched Just Now
                        </div>
                    </div>
                </motion.div>

                {/* Profile Details */}
                <div className="grid gap-6">
                    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Heart className="w-4 h-4" /> About Me
                                </div>
                                <p className="text-foreground/80 leading-relaxed font-medium">
                                    "{valentine?.bio || "This person hasn't added a bio yet."}"
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Briefcase className="w-4 h-4" /> Work / Field
                                </div>
                                <p className="text-foreground/80 font-medium">
                                    {valentine?.work || "Not specified"}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Coffee className="w-4 h-4" /> Hobbies
                                </div>
                                <p className="text-foreground/80 font-medium">
                                    {valentine?.hobbies || "Not specified"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Wishlist */}
                    {valentine?.wishlist_items && valentine.wishlist_items.length > 0 && (
                        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Gift className="w-4 h-4" /> Wishlist
                                </div>
                                <div className="space-y-3">
                                    {valentine.wishlist_items
                                        .sort((a: any, b: any) => a.display_order - b.display_order)
                                        .map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="bg-background/50 p-4 rounded-2xl hover:bg-background transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-primary/10 p-2 rounded-full">
                                                        <Gift className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-foreground">{item.name}</h4>
                                                        {item.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        {item.link && (
                                                            <a
                                                                href={item.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-primary hover:underline mt-2 inline-block"
                                                            >
                                                                View Link →
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 sticky bottom-6">
                    <Link href={`/chat?threadId=${matchData.chatThreadId}`} className="block w-full">
                        <Button
                            size="lg"
                            fullWidth
                            className="h-14 font-bold rounded-2xl shadow-xl shadow-primary/20"
                        >
                            <MessageCircle className="mr-2 w-5 h-5" />
                            Anonymous Chat
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
