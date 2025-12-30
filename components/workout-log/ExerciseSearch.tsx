'use client';

import { useState, useEffect, useCallback } from 'react';
import { getExercises } from '@/lib/actions/workout';
import type { Exercise } from '@/types/database.types';

interface ExerciseSearchProps {
    onSelect: (exerciseId: string) => void;
    onClose: () => void;
}

const MUSCLE_GROUPS = [
    { value: 'bröst', label: 'Bröst' },
    { value: 'rygg', label: 'Rygg' },
    { value: 'ben', label: 'Ben' },
    { value: 'axlar', label: 'Axlar' },
    { value: 'biceps', label: 'Biceps' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'core', label: 'Core' },
    { value: 'cardio', label: 'Cardio' },
];

export default function ExerciseSearch({ onSelect, onClose }: ExerciseSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchExercises = useCallback(async () => {
        setIsLoading(true);
        const { data } = await getExercises({
            muscleGroup: selectedMuscle || undefined,
            search: searchQuery || undefined,
        });
        setExercises(data || []);
        setIsLoading(false);
    }, [selectedMuscle, searchQuery]);

    useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchExercises();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchExercises]);

    const getMuscleGroupLabel = (muscleGroup: string) => {
        const found = MUSCLE_GROUPS.find(m => m.value === muscleGroup);
        return found?.label || muscleGroup;
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <div className="bg-surface border-b-2 border-primary/20 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={onClose}
                    className="text-primary/60 hover:text-primary p-2"
                >
                    ←
                </button>
                <h2 className="font-teko text-2xl uppercase tracking-wider text-primary">
                    Välj övning
                </h2>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3 bg-surface border-b border-primary/10">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sök övning..."
                    className="w-full bg-background border border-primary/20 px-4 py-3 font-inter text-primary placeholder-primary/40 focus:border-accent focus:outline-none"
                    autoFocus
                />
            </div>

            {/* Muscle Group Filters */}
            <div className="px-4 py-3 overflow-x-auto">
                <div className="flex gap-2 flex-nowrap">
                    <button
                        onClick={() => setSelectedMuscle(null)}
                        className={`px-3 py-1 font-inter text-xs uppercase tracking-wider border whitespace-nowrap transition-colors ${!selectedMuscle
                                ? 'bg-accent text-background border-accent'
                                : 'bg-transparent text-primary/60 border-primary/20 hover:border-accent'
                            }`}
                    >
                        Alla
                    </button>
                    {MUSCLE_GROUPS.map((muscle) => (
                        <button
                            key={muscle.value}
                            onClick={() => setSelectedMuscle(muscle.value)}
                            className={`px-3 py-1 font-inter text-xs uppercase tracking-wider border whitespace-nowrap transition-colors ${selectedMuscle === muscle.value
                                    ? 'bg-accent text-background border-accent'
                                    : 'bg-transparent text-primary/60 border-primary/20 hover:border-accent'
                                }`}
                        >
                            {muscle.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto px-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="font-inter text-primary/40">Laddar...</span>
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="font-inter text-primary/40">Inga övningar hittades</span>
                    </div>
                ) : (
                    <div className="divide-y divide-primary/10">
                        {exercises.map((exercise) => (
                            <button
                                key={exercise.id}
                                onClick={() => onSelect(exercise.id)}
                                className="w-full py-4 text-left hover:bg-accent/5 transition-colors"
                            >
                                <p className="font-inter text-primary font-medium">
                                    {exercise.name}
                                </p>
                                <p className="font-inter text-xs text-primary/50 mt-1">
                                    {getMuscleGroupLabel(exercise.muscle_group)}
                                    {exercise.equipment !== 'kroppsvikt' && ` • ${exercise.equipment}`}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
