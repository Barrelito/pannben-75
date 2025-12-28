/**
 * Workout Player Client Component
 * Main workout session interface with timer and controls
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useDailyLog } from '@/hooks/useDailyLog';
import OvertimeMode from '@/components/workout/OvertimeMode';
import ActiveSession from '@/components/workout/ActiveSession';
import { playCompletion } from '@/lib/audio/beep';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { WorkoutTrack } from '@/types/database.types';

interface WorkoutPlayerClientProps {
    user: User;
    track: WorkoutTrack;
}

export default function WorkoutPlayerClient({ user, track }: WorkoutPlayerClientProps) {
    const router = useRouter();
    const timer = useWorkoutTimer();
    const { toggleRule } = useDailyLog(user.id);

    const [hasStarted, setHasStarted] = useState(false);
    const [workoutType, setWorkoutType] = useState<'indoor' | 'outdoor' | null>(null);

    const structure = track.structure as any;

    const handleStart = (type: 'indoor' | 'outdoor') => {
        setWorkoutType(type);
        setHasStarted(true);
        timer.start();
    };

    const handleComplete = async () => {
        if (!timer.canComplete) return;

        try {
            await playCompletion();

            // Update daily log
            const rule = workoutType === 'outdoor'
                ? 'workout_outdoor_completed'
                : 'workout_indoor_completed';

            await toggleRule(rule as any, true);

            // Auto-post to Squad Feed (Fire and forget-ish, but await so we don't nav too fast if vital)
            try {
                const supabase = createClient();
                const { data: squads } = await supabase
                    .from('squad_members')
                    .select('squad_id')
                    .eq('user_id', user.id);

                if (squads && squads.length > 0) {
                    const location = workoutType === 'indoor' ? 'Inomhus' : 'Utomhus';
                    const message = `har just genomfört ${track.title} (${location}). ⚔️`;

                    const posts = squads.map(s => ({
                        squad_id: s.squad_id,
                        user_id: user.id,
                        content: message
                    }));

                    await supabase.from('feed_posts').insert(posts);
                }
            } catch (feedError) {
                console.error('Failed to post to feed:', feedError);
                // Don't block main flow
            }

            // Navigate back to dashboard
            router.push('/dashboard');
        } catch (error) {
            console.error('Error completing workout:', error);
            alert('Kunde inte spara träningen. Försök igen.');
        }
    };

    // Pre-start screen
    if (!hasStarted) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full space-y-6">
                    <h1 className="font-teko text-4xl uppercase tracking-wider text-accent text-center">
                        {track.title}
                    </h1>

                    <div className="bg-surface border-2 border-primary/20 p-6">
                        <p className="font-inter text-primary mb-4">
                            Välj träningstyp:
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleStart('outdoor')}
                                className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                            >
                                🏃 UTOMHUS
                            </button>

                            <button
                                onClick={() => handleStart('indoor')}
                                className="w-full px-8 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all"
                            >
                                🏋️ INOMHUS
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/workout')}
                        className="w-full text-center font-inter text-sm uppercase tracking-wider text-primary/60 hover:text-accent transition-colors"
                    >
                        ← Avbryt
                    </button>
                </div>
            </div>
        );
    }

    // Overtime mode
    if (timer.isOvertime) {
        return (
            <OvertimeMode
                remainingSeconds={timer.remainingTo45}
                remainingFormatted={timer.remainingTo45Formatted}
                canComplete={timer.canComplete}
                onComplete={handleComplete}
            />
        );
    }

    // Active workout
    return (
        <ActiveSession
            timer={timer}
            track={track}
            structure={structure}
            onComplete={handleComplete}
        />
    );
}
