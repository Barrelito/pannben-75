/**
 * Exercise Carousel Component
 * For bodyweight circuit workouts
 */

'use client';

import { useState } from 'react';

interface ExerciseCarouselProps {
    structure: any;
}

export default function ExerciseCarousel({ structure }: ExerciseCarouselProps) {
    const exercises = structure?.exercises || [];
    const rounds = structure?.rounds || 3;

    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);

    const currentExercise = exercises[currentExerciseIdx];

    const handleNext = () => {
        if (currentExerciseIdx < exercises.length - 1) {
            // Next exercise in same round
            setCurrentExerciseIdx(prev => prev + 1);
        } else if (currentRound < rounds) {
            // Start next round
            setCurrentExerciseIdx(0);
            setCurrentRound(prev => prev + 1);
        } else {
            // All done!
            setCurrentExerciseIdx(0);
            setCurrentRound(1);
        }
    };

    const handlePrev = () => {
        if (currentExerciseIdx > 0) {
            setCurrentExerciseIdx(prev => prev - 1);
        } else if (currentRound > 1) {
            setCurrentExerciseIdx(exercises.length - 1);
            setCurrentRound(prev => prev - 1);
        }
    };

    const totalExercises = exercises.length * rounds;
    const completedExercises = (currentRound - 1) * exercises.length + currentExerciseIdx;
    const progress = (completedExercises / totalExercises) * 100;

    return (
        <div className="space-y-6">
            {/* Round Progress */}
            <div className="text-center">
                <div className="font-teko text-2xl text-accent uppercase tracking-wider">
                    ROND {currentRound}/{rounds}
                </div>
            </div>

            {/* Current Exercise Card */}
            <div className="bg-surface border-2 border-accent p-8 text-center">
                <div className="mb-4">
                    <div className="font-teko text-6xl uppercase tracking-wider text-accent mb-2">
                        {currentExercise?.name || 'Övning'}
                    </div>
                    <div className="font-inter text-3xl text-primary">
                        {currentExercise?.reps && `${currentExercise.reps} reps`}
                        {currentExercise?.duration && `${currentExercise.duration}s`}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="font-inter text-xs uppercase tracking-wider text-primary/60">
                        FRAMSTEG
                    </span>
                    <span className="font-teko text-xl text-accent">
                        {completedExercises + 1}/{totalExercises}
                    </span>
                </div>
                <div className="h-3 bg-background border border-primary/20 overflow-hidden">
                    <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button
                    onClick={handlePrev}
                    disabled={currentRound === 1 && currentExerciseIdx === 0}
                    className="flex-1 px-6 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    ← FÖREGÅENDE
                </button>

                <button
                    onClick={handleNext}
                    className="flex-1 px-6 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                >
                    NÄSTA →
                </button>
            </div>

            {/* Exercise List */}
            <div className="bg-surface border-2 border-primary/20 p-4">
                <h4 className="font-inter text-xs uppercase tracking-wider text-primary/60 mb-3">
                    ÖVNINGAR
                </h4>
                <div className="space-y-1">
                    {exercises.map((ex: any, idx: number) => (
                        <div
                            key={idx}
                            className={`font-inter text-sm px-2 py-1 ${idx === currentExerciseIdx
                                    ? 'text-accent font-semibold'
                                    : 'text-primary/60'
                                }`}
                        >
                            {idx + 1}. {ex.name} • {ex.reps || ex.duration + 's'}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
