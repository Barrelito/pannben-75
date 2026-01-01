'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type {
    WorkoutSession,
    WorkoutExercise,
    WorkoutSet,
    Exercise,
    ProgramDay,
    ProgramExercise,
    UserProgram,
    WorkoutProgram
} from '@/types/database.types';
import {
    startWorkout,
    completeWorkout,
    cancelWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSet,
    updateSet,
    deleteSet,
    getActiveWorkout,
} from '@/lib/actions/workout';
import ExerciseSearch from './ExerciseSearch';
import SetRow from './SetRow';
import RestTimer from './RestTimer';

type WorkoutExerciseWithDetails = WorkoutExercise & {
    exercise: Exercise;
    sets: WorkoutSet[]
};

type ActiveWorkoutData = WorkoutSession & {
    exercises: WorkoutExerciseWithDetails[]
};

interface WorkoutLogClientProps {
    isPremium: boolean;
    activeWorkout: ActiveWorkoutData | null;
    recentWorkouts: WorkoutSession[];
    programDay?: ProgramDay & { exercises: (ProgramExercise & { exercise: Exercise })[] } | null;
    userProgram?: UserProgram & { program: WorkoutProgram } | null;
}

export default function WorkoutLogClient({
    isPremium,
    activeWorkout: initialActiveWorkout,
    recentWorkouts,
    programDay,
    userProgram
}: WorkoutLogClientProps) {
    const router = useRouter();
    const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutData | null>(initialActiveWorkout);
    const [isLoading, setIsLoading] = useState(false);
    const [showExerciseSearch, setShowExerciseSearch] = useState(false);
    const [showRestTimer, setShowRestTimer] = useState(false);
    const [restSeconds, setRestSeconds] = useState(90);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Calculate elapsed time
    useEffect(() => {
        if (!activeWorkout) return;

        const startTime = new Date(activeWorkout.started_at).getTime();

        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [activeWorkout]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartWorkout = async () => {
        setIsLoading(true);

        let name = undefined;
        if (programDay && userProgram) {
            name = `${programDay.name || 'Pass'} (V${programDay.week_number}D${programDay.day_number})`;
        }

        const { data, error } = await startWorkout(
            name,
            userProgram?.program_id,
            programDay?.id
        );

        if (error) {
            alert(error);
        } else if (data) {
            // Refetch to get full data
            const { data: fullWorkout } = await getActiveWorkout();
            setActiveWorkout(fullWorkout);
        }
        setIsLoading(false);
    };

    const handleStartCustomWorkout = async () => {
        setIsLoading(true);

        // Start empty workout (no program context)
        const { data, error } = await startWorkout(undefined, undefined, undefined);

        if (error) {
            alert(error);
        } else if (data) {
            const { data: fullWorkout } = await getActiveWorkout();
            setActiveWorkout(fullWorkout);
        }
        setIsLoading(false);
    };

    const handleCompleteWorkout = async () => {
        if (!activeWorkout) return;

        if (activeWorkout.exercises.length === 0) {
            alert('Lägg till minst en övning innan du avslutar passet');
            return;
        }

        setIsLoading(true);
        const { error } = await completeWorkout(activeWorkout.id);
        if (error) {
            alert(error);
        } else {
            setActiveWorkout(null);
            router.refresh();
        }
        setIsLoading(false);
    };

    const handleCancelWorkout = async () => {
        if (!activeWorkout) return;

        if (!confirm('Är du säker på att du vill avbryta passet? All data kommer att förloras.')) {
            return;
        }

        setIsLoading(true);
        const { error } = await cancelWorkout(activeWorkout.id);
        if (error) {
            alert(error);
        } else {
            setActiveWorkout(null);
            router.refresh();
        }
        setIsLoading(false);
    };

    const handleAddExercise = async (exerciseId: string) => {
        if (!activeWorkout) return;

        const { data, error } = await addExerciseToWorkout(activeWorkout.id, exerciseId);
        if (error) {
            alert(error);
        } else {
            // Refetch workout data
            const { data: updated } = await getActiveWorkout();
            setActiveWorkout(updated);
        }
        setShowExerciseSearch(false);
    };

    const handleRemoveExercise = async (workoutExerciseId: string) => {
        if (!confirm('Ta bort denna övning?')) return;

        const { error } = await removeExerciseFromWorkout(workoutExerciseId);
        if (error) {
            alert(error);
        } else {
            const { data: updated } = await getActiveWorkout();
            setActiveWorkout(updated);
        }
    };

    const handleAddSet = async (workoutExerciseId: string, weight?: number, reps?: number) => {
        const { error } = await addSet(workoutExerciseId, { weight, reps });
        if (error) {
            alert(error);
        } else {
            const { data: updated } = await getActiveWorkout();
            setActiveWorkout(updated);
            // Don't auto-start rest timer on manual add, wait for completion
        }
    };

    const handleUpdateSet = async (setId: string, weight: number | null, reps: number | null, completed?: boolean) => {
        const { error } = await updateSet(setId, { weight, reps, completed });
        if (error) {
            alert(error);
        } else {
            const { data: updated } = await getActiveWorkout();
            setActiveWorkout(updated);

            // If marked as completed, verify if we should start rest timer
            if (completed && !showRestTimer) {
                setShowRestTimer(true);
            }
        }
    };

    const handleDeleteSet = async (setId: string) => {
        const { error } = await deleteSet(setId);
        if (error) {
            alert(error);
        } else {
            const { data: updated } = await getActiveWorkout();
            setActiveWorkout(updated);
        }
    };

    // Premium gate
    if (!isPremium) {
        return (
            <div className="p-6">
                <div className="bg-surface border-2 border-accent p-8 text-center">
                    <span className="text-5xl mb-4 block">🏋️</span>
                    <h2 className="font-teko text-3xl uppercase tracking-wider text-accent mb-2">
                        TRÄNINGSLOGG
                    </h2>
                    <p className="font-inter text-primary/80 mb-6">
                        Logga dina träningspass, följ din utveckling och slå personliga rekord.
                    </p>
                    <p className="font-inter text-sm text-accent mb-4">
                        Kräver Premium
                    </p>
                    <button
                        onClick={() => router.push('/profile')}
                        className="px-6 py-3 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider"
                    >
                        Uppgradera till Premium
                    </button>
                </div>
            </div>
        );
    }

    // No active workout - show start screen
    if (!activeWorkout) {
        return (
            <div className="p-6 space-y-6">
                {/* Start New Workout */}
                <div className="bg-surface border-2 border-accent p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🏋️</span>
                        <h2 className="font-teko text-3xl uppercase tracking-wider text-accent">
                            STARTA PASS
                        </h2>
                    </div>
                    <p className="font-inter text-sm text-primary/80 mb-6">
                        Börja ett nytt träningspass och logga dina övningar och set.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={handleStartWorkout}
                            disabled={isLoading}
                            className="w-full px-6 py-4 bg-accent text-background font-inter font-bold text-lg uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'STARTAR...' : (programDay ? `STARTA ${userProgram?.program?.name || 'PROGRAM'} - V${programDay.week_number}D${programDay.day_number}` : 'STARTA NYTT PASS')}
                        </button>

                        {(programDay) && (
                            <button
                                onClick={handleStartCustomWorkout}
                                disabled={isLoading}
                                className="w-full px-6 py-4 bg-transparent text-primary/60 font-inter font-semibold text-xs uppercase tracking-wider border border-primary/20 hover:border-accent hover:text-accent transition-all disabled:opacity-50"
                            >
                                LOGGA EGET STYRKEPASS (UTANFÖR PROGRAM)
                            </button>
                        )}
                    </div>
                </div>

                {/* Recent Workouts */}
                {recentWorkouts.length > 0 && (
                    <div>
                        <h3 className="font-teko text-xl uppercase tracking-wider text-primary/60 mb-3">
                            SENASTE PASS
                        </h3>
                        <div className="space-y-2">
                            {recentWorkouts.map((workout) => (
                                <div
                                    key={workout.id}
                                    className="bg-surface border border-primary/20 p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-inter text-sm text-primary">
                                                {workout.name || new Date(workout.completed_at!).toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="font-inter text-xs text-primary/60">
                                                {workout.total_sets} set • {workout.total_reps} reps • {(workout.total_volume / 1000).toFixed(1)} ton
                                            </p>
                                        </div>
                                        <span className="font-teko text-lg text-accent">
                                            {Math.floor((workout.duration_seconds || 0) / 60)} min
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Active workout view
    return (
        <div className="flex flex-col h-[calc(100vh-80px)]">
            {/* Workout Header */}
            <div className="bg-surface border-b-2 border-primary/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCancelWorkout}
                        className="text-red-500 hover:text-red-400 p-2"
                        aria-label="Avbryt pass"
                    >
                        ✕
                    </button>
                    <div>
                        <p className="font-teko text-lg uppercase tracking-wider text-primary">
                            {activeWorkout.name || 'Pågående pass'}
                        </p>
                        <p className="font-inter text-xs text-accent">
                            {formatTime(elapsedTime)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleCompleteWorkout}
                    disabled={isLoading}
                    className="p-2 text-green-500 hover:text-green-400"
                    aria-label="Avsluta pass"
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </button>
            </div>

            {/* Exercises List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {activeWorkout.exercises.map((workoutExercise) => (
                    <div
                        key={workoutExercise.id}
                        className="bg-surface border border-primary/20"
                    >
                        {/* Exercise Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
                            <h3 className="font-teko text-xl uppercase tracking-wider text-primary">
                                {workoutExercise.exercise.name}
                            </h3>
                            <button
                                onClick={() => handleRemoveExercise(workoutExercise.id)}
                                className="text-primary/40 hover:text-red-500 p-1"
                            >
                                ⋮
                            </button>
                        </div>

                        {/* Sets Table Header */}
                        <div className="grid grid-cols-5 gap-2 px-4 py-2 text-center bg-background/50">
                            <span className="font-inter text-xs uppercase text-primary/40">SET</span>
                            <span className="font-inter text-xs uppercase text-primary/40">KG</span>
                            <span className="font-inter text-xs uppercase text-primary/40">REPS</span>
                            <span className="font-inter text-xs uppercase text-primary/40">KLAR</span>
                            <span className="font-inter text-xs uppercase text-primary/40"></span>
                        </div>

                        {/* Sets */}
                        <div className="divide-y divide-primary/10">
                            {workoutExercise.sets
                                .sort((a, b) => a.set_number - b.set_number)
                                .map((set) => (
                                    <SetRow
                                        key={set.id}
                                        set={set}
                                        onUpdate={(weight, reps, completed) => handleUpdateSet(set.id, weight, reps, completed)}
                                        onDelete={() => handleDeleteSet(set.id)}
                                    />
                                ))}
                        </div>

                        {/* Add Set Button */}
                        <button
                            onClick={() => {
                                const lastSet = workoutExercise.sets[workoutExercise.sets.length - 1];
                                handleAddSet(
                                    workoutExercise.id,
                                    lastSet?.weight ?? undefined,
                                    lastSet?.reps ?? undefined
                                );
                            }}
                            className="w-full px-4 py-3 text-accent font-inter text-sm uppercase tracking-wider hover:bg-accent/10 transition-colors"
                        >
                            + Lägg till set
                        </button>
                    </div>
                ))}

                {/* Add Exercise Button */}
                <button
                    onClick={() => setShowExerciseSearch(true)}
                    className="w-full px-6 py-4 bg-accent/10 border-2 border-dashed border-accent/40 text-accent font-inter font-semibold uppercase tracking-wider hover:bg-accent/20 transition-colors"
                >
                    + Lägg till övning
                </button>
            </div>

            {/* Bottom Stats Bar */}
            <div className="bg-surface border-t-2 border-primary/20 px-4 py-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="font-inter text-xs uppercase text-primary/40">Volym</p>
                        <p className="font-teko text-xl text-primary">
                            {((activeWorkout.exercises.reduce((total, ex) =>
                                total + ex.sets.reduce((setTotal, set) =>
                                    setTotal + ((set.weight || 0) * (set.reps || 0)), 0
                                ), 0
                            )) / 1000).toFixed(1)} ton
                        </p>
                    </div>
                    <div>
                        <p className="font-inter text-xs uppercase text-primary/40">Set</p>
                        <p className="font-teko text-xl text-primary">
                            {activeWorkout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
                        </p>
                    </div>
                    <div>
                        <p className="font-inter text-xs uppercase text-primary/40">Reps</p>
                        <p className="font-teko text-xl text-primary">
                            {activeWorkout.exercises.reduce((total, ex) =>
                                total + ex.sets.reduce((setTotal, set) => setTotal + (set.reps || 0), 0), 0
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Exercise Search Modal */}
            {showExerciseSearch && (
                <ExerciseSearch
                    onSelect={handleAddExercise}
                    onClose={() => setShowExerciseSearch(false)}
                />
            )}

            {/* Rest Timer */}
            {showRestTimer && (
                <RestTimer
                    seconds={restSeconds}
                    onComplete={() => setShowRestTimer(false)}
                    onClose={() => setShowRestTimer(false)}
                />
            )}
        </div>
    );
}
