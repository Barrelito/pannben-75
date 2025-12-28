/**
 * Set Tracker Component
 * For kettlebell workouts with checklists
 */

'use client';

import { useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';

interface SetTrackerProps {
    structure: any;
}

export default function SetTracker({ structure }: SetTrackerProps) {
    const exercises = structure?.exercises || [];

    // Track completed sets for each exercise
    const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>(() => {
        const initial: Record<string, boolean[]> = {};
        exercises.forEach((ex: any, idx: number) => {
            initial[idx] = Array(ex.sets || 1).fill(false);
        });
        return initial;
    });

    const toggleSet = (exerciseIdx: number, setIdx: number) => {
        setCompletedSets(prev => {
            const newSets = { ...prev };
            newSets[exerciseIdx] = [...newSets[exerciseIdx]];
            newSets[exerciseIdx][setIdx] = !newSets[exerciseIdx][setIdx];
            return newSets;
        });
    };

    return (
        <div className="space-y-6">
            {exercises.map((exercise: any, exerciseIdx: number) => {
                const sets = completedSets[exerciseIdx] || [];
                const completed = sets.filter(Boolean).length;
                const total = sets.length;

                return (
                    <div
                        key={exerciseIdx}
                        className="bg-surface border-2 border-primary/20 p-6"
                    >
                        {/* Exercise Header */}
                        <div className="mb-4">
                            <h3 className="font-teko text-3xl uppercase tracking-wider text-accent">
                                {exercise.name}
                            </h3>
                            <p className="font-inter text-sm text-primary/80">
                                {exercise.reps} reps
                                {exercise.each_side && ' (varje sida)'}
                            </p>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-inter text-xs uppercase tracking-wider text-primary/60">
                                    SETS
                                </span>
                                <span className="font-teko text-xl text-accent">
                                    {completed}/{total}
                                </span>
                            </div>
                            <div className="h-2 bg-background border border-primary/20 overflow-hidden">
                                <div
                                    className="h-full bg-accent transition-all duration-300"
                                    style={{ width: `${(completed / total) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Set Checkboxes */}
                        <div className="grid grid-cols-5 gap-2">
                            {sets.map((checked, setIdx) => (
                                <button
                                    key={setIdx}
                                    onClick={() => toggleSet(exerciseIdx, setIdx)}
                                    className={`aspect-square flex items-center justify-center border-2 font-teko text-xl transition-all ${checked
                                            ? 'bg-accent border-accent text-background'
                                            : 'bg-background border-primary/20 text-primary hover:border-accent'
                                        }`}
                                >
                                    {checked ? '✓' : setIdx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
