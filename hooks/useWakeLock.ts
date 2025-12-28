/**
 * Wake Lock Hook
 * Keeps screen awake during running sessions
 */

'use client';

import { useEffect, useRef } from 'react';

export function useWakeLock(isActive: boolean) {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    useEffect(() => {
        const requestWakeLock = async () => {
            if (!isActive) {
                // Release if we have one
                if (wakeLockRef.current) {
                    await wakeLockRef.current.release();
                    wakeLockRef.current = null;
                }
                return;
            }

            // Request wake lock
            if ('wakeLock' in navigator) {
                try {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                    console.log('Wake Lock activated');
                } catch (err) {
                    console.warn('Wake Lock failed:', err);
                }
            }
        };

        requestWakeLock();

        // Cleanup
        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
            }
        };
    }, [isActive]);

    return wakeLockRef.current !== null;
}
