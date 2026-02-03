"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { intervalToDuration, isBefore, type Duration } from "date-fns";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
    targetDate: Date;
    variant?: "large" | "small" | "inline";
    showSeconds?: boolean;
    onComplete?: () => void;
    className?: string;
}

export function CountdownTimer({
    targetDate,
    variant = "large",
    showSeconds = true,
    onComplete,
    className,
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<Duration>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            const now = new Date();
            if (isBefore(targetDate, now)) {
                clearInterval(timer);
                onComplete?.();
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const duration = intervalToDuration({
                start: now,
                end: targetDate,
            });

            setTimeLeft(duration);
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    if (!mounted) return null; // Avoid hydration mismatch on server render

    const TimeBlock = ({ value, label }: { value: number | undefined; label: string }) => (
        <div className="flex flex-col items-center">
            <div
                className={cn(
                    "font-bold tabular-nums leading-none text-foreground",
                    variant === "large" ? "text-5xl md:text-7xl" : "text-2xl md:text-3xl",
                    variant === "inline" && "text-base"
                )}
            >
                {String(value || 0).padStart(2, "0")}
            </div>
            {variant !== "inline" && (
                <span className="text-xs uppercase tracking-widest text-muted-foreground mt-2 font-medium">
                    {label}
                </span>
            )}
            {variant === "inline" && <span className="text-xs ml-1">{label}</span>}
        </div>
    );

    const Separator = () => (
        <div
            className={cn(
                "font-bold text-foreground/20 pb-4 flex items-start pt-2",
                variant === "large" ? "text-4xl md:text-6xl mx-4" : "text-xl md:text-2xl mx-2",
                variant === "inline" && "text-base mx-1 pb-0"
            )}
        >
            :
        </div>
    );

    return (
        <div className={cn("flex items-start justify-center", className)}>
            <TimeBlock value={timeLeft.days} label="Days" />
            <Separator />
            <TimeBlock value={timeLeft.hours} label="Hrs" />
            <Separator />
            <TimeBlock value={timeLeft.minutes} label="Mins" />
            {showSeconds && (
                <>
                    <Separator />
                    <TimeBlock value={timeLeft.seconds} label="Secs" />
                </>
            )}
        </div>
    );
}
