/**
 * Error Boundary
 * Catches runtime errors and provides recovery
 */

'use client';

import { useEffect } from 'react';
import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Error boundary caught:', error);
    }, [error]);

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <Logo />

                <div className="mt-12 space-y-6">
                    <h1 className="font-teko text-6xl text-status-red leading-none uppercase tracking-wider">
                        FEL UPPSTOD
                    </h1>

                    <p className="font-inter text-primary/80 max-w-md">
                        Något gick snett. Försök igen eller kontakta support om problemet kvarstår.
                    </p>

                    {error.digest && (
                        <p className="font-inter text-xs text-primary/40 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}

                    <div className="flex flex-col gap-3 max-w-sm mx-auto mt-8">
                        <button
                            onClick={reset}
                            className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                        >
                            🔄 FÖRSÖK IGEN
                        </button>

                        <a
                            href="/dashboard"
                            className="w-full px-8 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all text-center"
                        >
                            ← DASHBOARD
                        </a>
                    </div>
                </div>
            </main>
        </MobileContainer>
    );
}
