/**
 * Workout Timer Hook
 * Core timer logic with 45-minute enforcement and Screen Wake Lock API
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const MINIMUM_SECONDS = 45 * 60; // 2700 seconds = 45 minutes

export interface UseWorkoutTimerResult {
    // Time tracking
    elapsedSeconds: number;
    elapsedFormatted: string;
    remainingTo45: number;
    remainingTo45Formatted: string;

    // State
    isRunning: boolean;
    isPaused: boolean;
    isOvertime: boolean;
    canComplete: boolean;
    wakeLockActive: boolean;

    // Actions
    start: () => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    markWorkoutDone: () => void;
}

export function useWorkoutTimer(): UseWorkoutTimerResult {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [workoutDone, setWorkoutDone] = useState(false);
    const [wakeLockActive, setWakeLockActive] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const wakeLockRef = useRef<any>(null);

    // Format seconds to MM:SS
    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Calculate derived values
    const remainingTo45 = Math.max(0, MINIMUM_SECONDS - elapsedSeconds);
    const canComplete = elapsedSeconds >= MINIMUM_SECONDS;
    const isOvertime = workoutDone && !canComplete;

    const elapsedFormatted = formatTime(elapsedSeconds);
    const remainingTo45Formatted = formatTime(remainingTo45);

    // Screen Wake Lock API
    const requestWakeLock = useCallback(async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                setWakeLockActive(true);
                console.log('Screen Wake Lock активирован');

                wakeLockRef.current.addEventListener('release', () => {
                    console.log('Screen Wake Lock освобожден');
                    setWakeLockActive(false);
                });
            } else {
                console.warn('Screen Wake Lock API не поддерживается');
            }
        } catch (error) {
            console.error('Ошибка активации Wake Lock:', error);
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        try {
            if (wakeLockRef.current) {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                setWakeLockActive(false);
            }
        } catch (error) {
            console.error('Ошибка освобождения Wake Lock:', error);
        }
    }, []);

    // Timer logic
    const start = useCallback(() => {
        setIsRunning(true);
        setIsPaused(false);
        requestWakeLock();
    }, [requestWakeLock]);

    const pause = useCallback(() => {
        setIsPaused(true);
        setIsRunning(false);
    }, []);

    const resume = useCallback(() => {
        setIsPaused(false);
        setIsRunning(true);
    }, []);

    const reset = useCallback(() => {
        setElapsedSeconds(0);
        setIsRunning(false);
        setIsPaused(false);
        setWorkoutDone(false);
        releaseWakeLock();
    }, [releaseWakeLock]);

    const markWorkoutDone = useCallback(() => {
        setWorkoutDone(true);
    }, []);

    // Interval effect
    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, isPaused]);

    // Re-request wake lock on visibility change (if user switches tabs)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isRunning && !wakeLockActive) {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isRunning, wakeLockActive, requestWakeLock]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            releaseWakeLock();
        };
    }, [releaseWakeLock]);

    return {
        elapsedSeconds,
        elapsedFormatted,
        remainingTo45,
        remainingTo45Formatted,
        isRunning,
        isPaused,
        isOvertime,
        canComplete,
        wakeLockActive,
        start,
        pause,
        resume,
        reset,
        markWorkoutDone,
    };
}
