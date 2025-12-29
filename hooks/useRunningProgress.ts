/**
 * Running Progress Hook
 * Tracks completed sessions using localStorage
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pannben75_running_progress';

interface RunningProgress {
    completedSessions: string[]; // Array of session IDs
}

export function useRunningProgress() {
    const [completedSessions, setCompletedSessions] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const progress: RunningProgress = JSON.parse(stored);
                setCompletedSessions(progress.completedSessions || []);
            }
        } catch (e) {
            console.error('Failed to load running progress:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever completedSessions changes
    useEffect(() => {
        if (!isLoaded) return;

        try {
            const progress: RunningProgress = { completedSessions };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            console.error('Failed to save running progress:', e);
        }
    }, [completedSessions, isLoaded]);

    const markSessionComplete = useCallback((sessionId: string) => {
        setCompletedSessions(prev => {
            if (prev.includes(sessionId)) return prev;
            return [...prev, sessionId];
        });
    }, []);

    const isSessionComplete = useCallback((sessionId: string) => {
        return completedSessions.includes(sessionId);
    }, [completedSessions]);

    const resetProgress = useCallback(() => {
        setCompletedSessions([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        completedSessions,
        markSessionComplete,
        isSessionComplete,
        resetProgress,
        isLoaded,
    };
}
