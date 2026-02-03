"use client";

import { Suspense } from "react";
import ChatPageContent from "./ChatPageContent";

export const dynamic = 'force-dynamic';

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <ChatPageContent />
        </Suspense>
    );
}
