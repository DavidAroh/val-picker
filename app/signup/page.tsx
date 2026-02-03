'use client';

import { Suspense } from 'react';
import SignupPageContent from './SignupPageContent';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <SignupPageContent />
        </Suspense>
    );
}
