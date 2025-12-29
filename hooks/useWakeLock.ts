/**
 * Wake Lock Hook
 * Keeps screen awake during running sessions
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useWakeLock(isActive: boolean) {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const requestWakeLock = useCallback(async () => {
        if (!isActive) return;

        // Already have a valid lock
        if (wakeLockRef.current && !wakeLockRef.current.released) return;

        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock activated');
            } catch (err) {
                console.warn('Wake Lock failed:', err);
            }
        }
    }, [isActive]);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
            } catch (err) {
                // Ignore release errors
            }
            wakeLockRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isActive) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }

        // Re-acquire wake lock when user returns to tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isActive) {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseWakeLock();
        };
    }, [isActive, requestWakeLock, releaseWakeLock]);

    return wakeLockRef.current !== null;
}

