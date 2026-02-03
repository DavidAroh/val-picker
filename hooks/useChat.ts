"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string; // ISO string
    isMe: boolean;
    type: "text" | "image";
}

export function useChat() {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // Load initial mock messages
    useEffect(() => {
        // In a real app, we'd fetch based on match ID
        setMessages([
            {
                id: "1",
                senderId: "match",
                text: "Hello! Is this my secret valentine? 👀",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                isMe: false,
                type: "text"
            }
        ]);
    }, []);

    const sendMessage = (text: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: "me",
            text,
            timestamp: new Date().toISOString(),
            isMe: true,
            type: "text"
        };

        setMessages(prev => [...prev, newMessage]);

        // Mock response
        setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                const reply: Message = {
                    id: (Date.now() + 1).toString(),
                    senderId: "match",
                    text: "That sounds mysterious! I can't wait to find out more...",
                    timestamp: new Date().toISOString(),
                    isMe: false,
                    type: "text"
                };
                setMessages(prev => [...prev, reply]);
                setIsTyping(false);
            }, 2000);
        }, 1000);
    };

    return {
        messages,
        sendMessage,
        isTyping
    };
}
