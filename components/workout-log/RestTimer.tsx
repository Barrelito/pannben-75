'use client';

import { useState, useEffect, useRef } from 'react';

interface RestTimerProps {
    seconds: number;
    onComplete: () => void;
    onClose: () => void;
}

export default function RestTimer({ seconds: initialSeconds, onComplete, onClose }: RestTimerProps) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isPaused, setIsPaused] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isPaused) return;

        if (seconds <= 0) {
            // Play completion sound
            try {
                audioRef.current = new Audio('/sounds/timer-complete.mp3');
                audioRef.current.play().catch(() => {
                    // Ignore audio errors
                });
            } catch {
                // Ignore audio errors
            }
            onComplete();
            return;
        }

        const timer = setTimeout(() => {
            setSeconds(s => s - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [seconds, isPaused, onComplete]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((initialSeconds - seconds) / initialSeconds) * 100;

    const addTime = (amount: number) => {
        setSeconds(s => Math.max(0, s + amount));
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-primary/60 hover:text-primary p-2"
            >
                ✕
            </button>

            {/* Title */}
            <p className="font-inter text-sm uppercase tracking-wider text-primary/60 mb-4">
                Vila
            </p>

            {/* Timer Circle */}
            <div className="relative w-48 h-48 mb-8">
                {/* Background Circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-primary/10"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                        className="text-accent transition-all duration-1000"
                    />
                </svg>

                {/* Time Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-teko text-6xl text-primary">
                        {formatTime(seconds)}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => addTime(-15)}
                    className="w-12 h-12 bg-surface border border-primary/20 rounded-full flex items-center justify-center text-primary/60 hover:text-primary hover:border-accent transition-colors"
                >
                    -15
                </button>

                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-background text-2xl hover:bg-accent/80 transition-colors"
                >
                    {isPaused ? '▶' : '⏸'}
                </button>

                <button
                    onClick={() => addTime(15)}
                    className="w-12 h-12 bg-surface border border-primary/20 rounded-full flex items-center justify-center text-primary/60 hover:text-primary hover:border-accent transition-colors"
                >
                    +15
                </button>
            </div>

            {/* Skip Button */}
            <button
                onClick={onClose}
                className="font-inter text-sm uppercase tracking-wider text-primary/40 hover:text-primary transition-colors"
            >
                Hoppa över
            </button>
        </div>
    );
}
