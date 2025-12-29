/**
 * Session Player Component
 * Interactive running session with audio cues
 */

'use client';

import { useRouter } from 'next/navigation';
import { useRunCoach } from '@/hooks/useRunCoach';
import type { Session } from '@/lib/data/runningProgram';
import MobileContainer from '@/components/layout/MobileContainer';
import { createClient } from '@/lib/supabase/client';
import { getToday } from '@/lib/utils/dates';

interface SessionPlayerProps {
    session: Session;
    userId: string;
}

export default function SessionPlayer({ session, userId }: SessionPlayerProps) {
    const router = useRouter();
    const {
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
    } = useRunCoach(session);

    const supabase = createClient();

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Background color based on interval type
    const getBgColor = () => {
        if (!currentInterval) return 'bg-background';
        switch (currentInterval.type) {
            case 'RUN':
                return 'bg-status-green';
            case 'WALK':
            case 'WARMUP':
            case 'COOLDOWN':
                return 'bg-accent';
            default:
                return 'bg-background';
        }
    };

    const getIcon = () => {
        if (!currentInterval) return '';
        switch (currentInterval.type) {
            case 'RUN':
                return '🏃';
            case 'WALK':
            case 'WARMUP':
            case 'COOLDOWN':
                return '🚶';
            default:
                return '';
        }
    };

    const handleComplete = async () => {
        // Navigate immediately, don't wait for DB update
        router.push('/dashboard');

        // Mark outdoor workout as completed in background
        try {
            const today = getToday();
            await supabase
                .from('daily_logs')
                .upsert({
                    user_id: userId,
                    log_date: today,
                    workout_outdoor_completed: true,
                }, {
                    onConflict: 'user_id,log_date'
                });
        } catch (err) {
            console.error('Error updating log:', err);
        }
    };

    if (status === 'COMPLETED') {
        return (
            <MobileContainer>
                <div className="min-h-screen flex flex-col items-center justify-center bg-status-green p-6 text-center">
                    <div className="text-8xl mb-8">🏆</div>
                    <h1 className="font-teko text-6xl uppercase text-background mb-4">
                        BRA JOBBAT!
                    </h1>
                    <p className="font-inter text-background/90 text-lg mb-2">
                        {session.title} - Klart!
                    </p>
                    <p className="font-inter text-background/70 mb-12">
                        Total tid: {formatTime(totalElapsedSeconds)}
                    </p>
                    <button
                        onClick={handleComplete}
                        className="px-12 py-6 bg-background text-status-green font-teko text-3xl uppercase tracking-wider border-4 border-background hover:bg-transparent hover:text-background transition-all"
                    >
                        TILLBAKA
                    </button>
                </div>
            </MobileContainer>
        );
    }

    if (status === 'IDLE') {
        return (
            <MobileContainer>
                <div className="min-h-screen bg-background p-6">
                    <button
                        onClick={() => router.back()}
                        className="text-primary/60 hover:text-accent mb-8 font-inter text-sm"
                    >
                        ← TILLBAKA
                    </button>

                    <div className="text-center mb-12">
                        <h1 className="font-teko text-5xl uppercase text-accent mb-2">
                            {session.title}
                        </h1>
                        <p className="font-inter text-primary/60">
                            {session.totalMinutes} minuter
                        </p>
                    </div>

                    {/* Session Summary */}
                    <div className="bg-surface border-2 border-primary/20 p-6 mb-12">
                        <h2 className="font-inter text-sm uppercase tracking-wider text-primary/60 mb-4">
                            PASSETS UPPLÄGG:
                        </h2>
                        <ul className="space-y-3">
                            {session.summary.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className="text-accent font-bold">•</span>
                                    <span className="font-inter text-primary">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Screen Reminder */}
                    <div className="bg-accent/10 border border-accent p-4 mb-8">
                        <p className="font-inter text-sm text-accent text-center">
                            📱 Håll skärmen på under passet!
                        </p>
                    </div>

                    <button
                        onClick={start}
                        className="w-full py-8 bg-accent text-background font-teko text-4xl uppercase tracking-widest border-4 border-accent hover:bg-transparent hover:text-accent transition-all"
                    >
                        STARTA PASSET
                    </button>
                </div>
            </MobileContainer>
        );
    }

    // RUNNING or PAUSED
    const nextInterval = session.intervals[currentIntervalIndex + 1];

    return (
        <MobileContainer>
            <div className={`min-h-screen ${getBgColor()} transition-colors duration-500 p-6 flex flex-col`}>
                {/* Header */}
                <div className="text-center mb-8">
                    <p className="font-inter text-background/70 text-sm mb-1">
                        Interval {currentIntervalIndex + 1} av {session.intervals.length}
                    </p>
                    <h2 className="font-teko text-3xl uppercase text-background">
                        {session.title}
                    </h2>
                </div>

                {/* Main Display */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-9xl mb-8">{getIcon()}</div>

                    <h1 className="font-teko text-8xl uppercase text-background mb-8 tracking-wider">
                        {currentInterval?.type}
                    </h1>

                    <div className="font-teko text-[120px] leading-none text-background mb-12">
                        {formatTime(secondsRemaining)}
                    </div>

                    {nextInterval && (
                        <div className="bg-background/20 px-6 py-3 rounded-lg">
                            <p className="font-inter text-xs uppercase text-background/70 mb-1">
                                Nästa:
                            </p>
                            <p className="font-inter text-lg text-background">
                                {nextInterval.type === 'RUN' ? '🏃' : '🚶'} {nextInterval.type} - {formatTime(nextInterval.durationSeconds)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={stop}
                        className="py-4 bg-status-red text-primary font-inter font-bold text-sm uppercase tracking-wider border-2 border-status-red hover:bg-transparent hover:text-status-red transition-all"
                    >
                        AVBRYT
                    </button>
                    <button
                        onClick={status === 'RUNNING' ? pause : resume}
                        className="py-4 bg-background text-accent font-teko text-2xl uppercase tracking-wider border-4 border-background hover:bg-transparent hover:text-background transition-all"
                    >
                        {status === 'RUNNING' ? 'PAUS' : 'FORTSÄTT'}
                    </button>
                    <button
                        onClick={skip}
                        className="py-4 bg-background/50 text-background font-inter font-bold text-sm uppercase tracking-wider border-2 border-background hover:bg-background transition-all"
                    >
                        HOPPA
                    </button>
                </div>
            </div>
        </MobileContainer>
    );
}
