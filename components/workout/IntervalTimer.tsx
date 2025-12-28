/**
 * Interval Timer Component
 * For running workouts with run/walk intervals
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { playBeep, playIntervalChange } from '@/lib/audio/beep';

interface IntervalTimerProps {
    structure: any;
    elapsedSeconds: number;
}

export default function IntervalTimer({ structure, elapsedSeconds }: IntervalTimerProps) {
    // Default to Week 1 for now (could be user-selected later)
    const weekData = structure?.weeks?.['1'] || { run: 60, walk: 90, cycles: 15 };

    const [currentInterval, setCurrentInterval] = useState<'run' | 'walk'>('run');
    const [intervalSecondsLeft, setIntervalSecondsLeft] = useState(weekData.run);
    const [cycleNumber, setCycleNumber] = useState(1);

    const prevElapsedRef = useRef(0);
    const hasBeepedRef = useRef(false);

    useEffect(() => {
        if (elapsedSeconds === prevElapsedRef.current) return;

        const diff = elapsedSeconds - prevElapsedRef.current;
        prevElapsedRef.current = elapsedSeconds;

        setIntervalSecondsLeft((prev: number) => {
            const newValue = prev - diff;

            if (newValue <= 0) {
                // Switch interval
                const nextInterval = currentInterval === 'run' ? 'walk' : 'run';
                const nextDuration = nextInterval === 'run' ? weekData.run : weekData.walk;

                // Audio cue
                playIntervalChange(nextInterval);

                if (nextInterval === 'run') {
                    setCycleNumber(c => c + 1);
                }

                setCurrentInterval(nextInterval);
                hasBeepedRef.current = false;

                return nextDuration;
            }

            // Beep at 3 seconds before change
            if (newValue <= 3 && !hasBeepedRef.current) {
                playBeep(440, 0.1);
                hasBeepedRef.current = true;
            }

            return newValue;
        });
    }, [elapsedSeconds, currentInterval, weekData]);

    const bgColor = currentInterval === 'run' ? 'bg-status-green' : 'bg-status-yellow';
    const text = currentInterval === 'run' ? 'SPRING!' : 'GÅ!';

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`${bgColor} p-8 border-2 border-primary/20 text-center`}>
            <h2 className="font-teko text-5xl uppercase tracking-wider text-primary mb-8">
                {text}
            </h2>

            <div className="font-teko text-9xl text-primary leading-none mb-8">
                {formatTime(intervalSecondsLeft)}
            </div>

            <div className="font-inter text-lg text-primary/80">
                Intervall {cycleNumber}/{weekData.cycles}
            </div>
        </div>
    );
}
