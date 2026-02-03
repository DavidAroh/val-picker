"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const HeartIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

export function BackgroundDecorations() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const hearts = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        size: Math.random() * 60 + 30,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.3 + 0.15,
    }));

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Dynamic Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-accent/40 rounded-full blur-[100px]"
            />

            {/* Floating Hearts */}
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    initial={{ y: "110vh", opacity: 0 }}
                    animate={{
                        y: "-10vh",
                        opacity: [0, heart.opacity, heart.opacity, 0],
                        x: ["0%", `${(heart.id % 2 === 0 ? 1 : -1) * (Math.random() * 15 + 5)}%`, "0%"],
                    }}
                    transition={{
                        duration: heart.duration,
                        repeat: Infinity,
                        delay: heart.delay,
                        ease: "linear",
                    }}
                    style={{
                        position: "absolute",
                        left: heart.left,
                        width: heart.size,
                        height: heart.size,
                        color: "var(--primary)",
                    }}
                >
                    <HeartIcon className="w-full h-full opacity-40" />
                </motion.div>
            ))}
        </div>
    );
}
