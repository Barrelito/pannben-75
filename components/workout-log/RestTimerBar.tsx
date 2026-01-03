'use client';

import { useState, useEffect, useRef } from 'react';

interface RestTimerBarProps {
    duration: number; // Total duration in seconds
    startedAt: number | null; // Timestamp when timer started
    isPaused: boolean;
    pausedAt: number | null; // Timestamp when paused
    onReset: () => void;
    onTogglePause: () => void;
    onTimerClick: () => void; // Opens settings dialog
    onComplete: () => void;
}

export default function RestTimerBar({
    duration,
    startedAt,
    isPaused,
    pausedAt,
    onReset,
    onTogglePause,
    onTimerClick,
    onComplete
}: RestTimerBarProps) {
    const [remaining, setRemaining] = useState(duration);
    const completedRef = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!startedAt) {
            setRemaining(duration);
            completedRef.current = false;
            return;
        }

        const calculateRemaining = () => {
            let elapsed: number;

            if (isPaused && pausedAt) {
                // If paused, calculate elapsed up to pause time
                elapsed = Math.floor((pausedAt - startedAt) / 1000);
            } else {
                // If running, calculate elapsed to now
                elapsed = Math.floor((Date.now() - startedAt) / 1000);
            }

            return Math.max(0, duration - elapsed);
        };

        // Initial calculation
        const initialRemaining = calculateRemaining();
        setRemaining(initialRemaining);

        // Check if already completed
        if (initialRemaining <= 0 && !completedRef.current) {
            completedRef.current = true;
            // Play sound
            try {
                audioRef.current = new Audio('/sounds/timer-complete.mp3');
                audioRef.current.play().catch(() => { });
            } catch {
                // Ignore
            }
            onComplete();
            return;
        }

        if (isPaused) return;

        // Update every 100ms for smooth display
        const interval = setInterval(() => {
            const newRemaining = calculateRemaining();
            setRemaining(newRemaining);

            if (newRemaining <= 0 && !completedRef.current) {
                completedRef.current = true;
                clearInterval(interval);
                // Play sound
                try {
                    audioRef.current = new Audio('/sounds/timer-complete.mp3');
                    audioRef.current.play().catch(() => { });
                } catch {
                    // Ignore
                }
                onComplete();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [startedAt, duration, isPaused, pausedAt, onComplete]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = startedAt ? ((duration - remaining) / duration) * 100 : 0;

    return (
        <div className="fixed left-0 right-0 bottom-20 z-40 bg-surface border-t-2 border-b-2 border-accent/30">
            {/* Progress bar */}
            <div
                className="absolute top-0 left-0 h-1 bg-accent transition-all duration-100"
                style={{ width: `${progress}%` }}
            />

            <div className="flex items-center justify-between px-4 py-3">
                {/* Reset button */}
                <button
                    onClick={onReset}
                    className="w-12 h-12 flex items-center justify-center text-primary/60 hover:text-accent transition-colors"
                    aria-label="Återställ timer"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                {/* Timer display (clickable) */}
                <button
                    onClick={onTimerClick}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-accent/10 transition-colors rounded"
                >
                    <span className={`font-teko text-4xl ${remaining <= 10 ? 'text-red-500' : 'text-accent'}`}>
                        {formatTime(remaining)}
                    </span>
                    <span className="text-primary/40 text-xs">⚙️</span>
                </button>

                {/* Pause/Play button */}
                <button
                    onClick={onTogglePause}
                    className="w-12 h-12 flex items-center justify-center bg-accent/20 border border-accent rounded-full text-accent hover:bg-accent hover:text-background transition-colors"
                    aria-label={isPaused ? 'Starta timer' : 'Pausa timer'}
                >
                    {isPaused ? (
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
