"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";

interface Message {
    id: string;
    sender_id: string;
    message_text: string;
    sent_at: string;
}

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useUser();
    const threadId = searchParams.get("threadId");

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!threadId) {
            router.push("/home");
            return;
        }

        fetchMessages();
        subscribeToMessages();
    }, [threadId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch(`/api/chat/thread/${threadId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (result.success) {
                setMessages(result.data.messages || []);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`chat:${threadId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `thread_id=eq.${threadId}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const messageText = newMessage;
        setNewMessage("");

        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const response = await fetch("/api/chat/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    threadId,
                    message: messageText,
                }),
            });

            const result = await response.json();
            if (!result.success) {
                toast.error(result.error?.message || "Failed to send message");
                setNewMessage(messageText);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
            setNewMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent">
            <Navbar />

            <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/valentine-match">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Anonymous Chat</h1>
                        <p className="text-xs text-muted-foreground">
                            Your identity is hidden until you choose to reveal it
                        </p>
                    </div>
                </div>

                {/* Messages Container */}
                <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-border/60 mb-4 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <AnimatePresence initial={false}>
                            {messages.map((message) => {
                                const isMe = message.sender_id === user?.id;
                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMe
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-secondary-foreground"
                                                }`}
                                        >
                                            <p className="text-sm break-words">{message.message_text}</p>
                                            <p
                                                className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-secondary-foreground/70"
                                                    }`}
                                            >
                                                {new Date(message.sent_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={sendMessage}
                        className="border-t border-border/60 p-4 bg-background/50"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-background border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                                disabled={sending}
                                maxLength={1000}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="h-12 w-12 rounded-2xl"
                                disabled={sending || !newMessage.trim()}
                            >
                                {sending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Messages are anonymous • {newMessage.length}/1000
                        </p>
                    </form>
                </Card>
            </main>
        </div>
    );
}
