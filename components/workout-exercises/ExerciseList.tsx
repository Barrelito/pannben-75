'use client';

import { useState, useMemo } from 'react';
import type { Exercise } from '@/types/database.types';
import { deleteExercise } from '@/lib/actions/workout';
import ExerciseForm from './ExerciseForm';

interface ExerciseListProps {
    initialExercises: Exercise[];
    userId: string;
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

export default function ExerciseList({ initialExercises, userId }: ExerciseListProps) {
    const [exercises, setExercises] = useState(initialExercises);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMuscle, setFilterMuscle] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'custom'>('all');

    // Filter Logic
    const filteredExercises = useMemo(() => {
        return exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMuscle = filterMuscle ? ex.muscle_group === filterMuscle : true;
            const matchesView = viewMode === 'custom' ? !ex.is_system : true;
            return matchesSearch && matchesMuscle && matchesView;
        });
    }, [exercises, searchQuery, filterMuscle, viewMode]);

    const handleDelete = async (id: string) => {
        if (!confirm('Är du säker på att du vill ta bort denna övning?')) return;

        const { error } = await deleteExercise(id);
        if (error) {
            alert(error);
        } else {
            setExercises(prev => prev.filter(ex => ex.id !== id));
        }
    };

    if (showCreateForm) {
        return (
            <div className="bg-surface border border-primary/20 p-6">
                <h2 className="font-teko text-2xl uppercase tracking-wider text-primary mb-6">
                    Skapa ny övning
                </h2>
                <ExerciseForm
                    onSuccess={(newExercise) => {
                        setExercises(prev => [...prev, newExercise]);
                        setShowCreateForm(false);
                    }}
                    onCancel={() => setShowCreateForm(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Sök övning..."
                        className="flex-1 bg-background border border-primary/20 px-4 py-3 font-inter text-primary placeholder-primary/40 focus:border-accent focus:outline-none"
                    />
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-4 py-3 bg-accent text-background font-inter font-bold text-xl uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                    >
                        +
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilterMuscle(null)}
                        className={`px-3 py-1 font-inter text-xs uppercase tracking-wider border whitespace-nowrap transition-colors ${!filterMuscle
                                ? 'bg-accent text-background border-accent'
                                : 'bg-transparent text-primary/60 border-primary/20 hover:border-accent'
                            }`}
                    >
                        Alla
                    </button>
                    {MUSCLE_GROUPS.map((muscle) => (
                        <button
                            key={muscle.value}
                            onClick={() => setFilterMuscle(muscle.value)}
                            className={`px-3 py-1 font-inter text-xs uppercase tracking-wider border whitespace-nowrap transition-colors ${filterMuscle === muscle.value
                                    ? 'bg-accent text-background border-accent'
                                    : 'bg-transparent text-primary/60 border-primary/20 hover:border-accent'
                                }`}
                        >
                            {muscle.label}
                        </button>
                    ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex border-b border-primary/20">
                    <button
                        onClick={() => setViewMode('all')}
                        className={`flex-1 py-2 font-inter text-sm uppercase tracking-wider transition-colors border-b-2 ${viewMode === 'all'
                                ? 'text-accent border-accent'
                                : 'text-primary/60 border-transparent hover:text-primary'
                            }`}
                    >
                        Alla ({exercises.length})
                    </button>
                    <button
                        onClick={() => setViewMode('custom')}
                        className={`flex-1 py-2 font-inter text-sm uppercase tracking-wider transition-colors border-b-2 ${viewMode === 'custom'
                                ? 'text-accent border-accent'
                                : 'text-primary/60 border-transparent hover:text-primary'
                            }`}
                    >
                        Mina ({exercises.filter(e => !e.is_system).length})
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-3">
                {filteredExercises.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="font-inter text-primary/40">Inga övningar hittades</p>
                    </div>
                ) : (
                    filteredExercises.map((exercise) => (
                        <div
                            key={exercise.id}
                            className="bg-surface border border-primary/20 p-4 flex items-center justify-between group"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-teko text-xl uppercase tracking-wider text-primary">
                                        {exercise.name}
                                    </h3>
                                    {!exercise.is_system && (
                                        <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] uppercase font-inter rounded">
                                            EGEN
                                        </span>
                                    )}
                                </div>
                                <p className="font-inter text-xs text-primary/60">
                                    {MUSCLE_GROUPS.find(m => m.value === exercise.muscle_group)?.label} • {exercise.equipment}
                                </p>
                            </div>

                            {/* Actions for custom exercises */}
                            {!exercise.is_system && exercise.created_by === userId && (
                                <button
                                    onClick={() => handleDelete(exercise.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-red-400"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
