/**
 * Running Coach Hook
 * State machine for interval training with audio cues
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Session, Interval } from '@/lib/data/runningProgram';
import { useWakeLock } from './useWakeLock';

type CoachStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

interface UseRunCoachResult {
    status: CoachStatus;
    currentInterval: Interval | null;
    currentIntervalIndex: number;
    secondsRemaining: number;
    totalElapsedSeconds: number;
    start: () => void;
    pause: () => void;
    resume: () => void;
    skip: () => void;
    stop: () => void;
}

function speak(text: string): void {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech Synthesis not supported');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'sv-SE';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

export function useRunCoach(session: Session): UseRunCoachResult {
    const [status, setStatus] = useState<CoachStatus>('IDLE');
    const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Enable wake lock when running
    useWakeLock(status === 'RUNNING');

    const currentInterval = session.intervals[currentIntervalIndex] || null;

    // Timer tick
    useEffect(() => {
        if (status !== 'RUNNING') {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    // Move to next interval
                    setCurrentIntervalIndex(prevIdx => {
                        const nextIdx = prevIdx + 1;

                        if (nextIdx >= session.intervals.length) {
                            // Session complete
                            setStatus('COMPLETED');
                            speak('Passet är klart! Fantastiskt jobbat!');
                            return prevIdx;
                        }

                        // Start next interval
                        const nextInterval = session.intervals[nextIdx];
                        speak(nextInterval.voiceCue);
                        setSecondsRemaining(nextInterval.durationSeconds);

                        return nextIdx;
                    });

                    return 0;
                }

                setTotalElapsedSeconds(t => t + 1);
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [status, session.intervals]);

    const start = useCallback(() => {
        setStatus('RUNNING');
        setCurrentIntervalIndex(0);
        setTotalElapsedSeconds(0);

        const firstInterval = session.intervals[0];
        setSecondsRemaining(firstInterval.durationSeconds);
        speak(firstInterval.voiceCue);
    }, [session.intervals]);

    const pause = useCallback(() => {
        setStatus('PAUSED');
    }, []);

    const resume = useCallback(() => {
        setStatus('RUNNING');
    }, []);

    const skip = useCallback(() => {
        if (currentIntervalIndex >= session.intervals.length - 1) {
            setStatus('COMPLETED');
            speak('Passet är klart!');
            return;
        }

        const nextIdx = currentIntervalIndex + 1;
        const nextInterval = session.intervals[nextIdx];

        setCurrentIntervalIndex(nextIdx);
        setSecondsRemaining(nextInterval.durationSeconds);
        speak(nextInterval.voiceCue);
    }, [currentIntervalIndex, session.intervals]);

    const stop = useCallback(() => {
        setStatus('IDLE');
        setCurrentIntervalIndex(0);
        setSecondsRemaining(0);
        setTotalElapsedSeconds(0);
        window.speechSynthesis.cancel();
    }, []);

    return {
        status,
        currentInterval,
        currentIntervalIndex,
        secondsRemaining,
        totalElapsedSeconds,
        start,
        pause,
        resume,
        skip,
        stop,
    };
}
