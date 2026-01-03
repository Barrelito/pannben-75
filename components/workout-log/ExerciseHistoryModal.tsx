/**
 * ExerciseHistoryModal Component
 * Shows previous workout history for an exercise (last 3 sessions)
 */

'use client';

import { useState, useEffect } from 'react';
import { getExerciseHistory } from '@/lib/actions/workout';

interface ExerciseHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseId: string;
    exerciseName: string;
}

type HistoryItem = {
    date: string;
    sets: { weight: number | null; reps: number | null; set_type: string }[];
};

export default function ExerciseHistoryModal({
    isOpen,
    onClose,
    exerciseId,
    exerciseName,
}: ExerciseHistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && exerciseId) {
            setLoading(true);
            getExerciseHistory(exerciseId)
                .then(({ data }) => {
                    setHistory(data);
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, exerciseId]);

    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('sv-SE', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50"
                onClick={onClose}
            />

            {/* Modal - positioned from bottom for mobile-friendly */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t-2 border-primary/20 rounded-t-2xl max-h-[60vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
                {/* Handle bar */}
                <div className="flex justify-center py-2">
                    <div className="w-10 h-1 bg-primary/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-4 pb-3 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                        <h2 className="font-teko text-xl uppercase tracking-wider text-primary">
                            {exerciseName}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-primary/40 hover:text-primary p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="font-inter text-xs text-primary/50">Senaste pass</p>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[45vh] p-4 space-y-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="font-inter text-sm text-primary/60">Laddar...</p>
                        </div>
                    ) : !history || history.length === 0 ? (
                        <div className="text-center py-8">
                            <span className="text-4xl mb-2 block">📋</span>
                            <p className="font-inter text-sm text-primary/60">
                                Ingen historik för denna övning ännu
                            </p>
                        </div>
                    ) : (
                        history.map((session, index) => (
                            <div
                                key={index}
                                className="bg-background/50 border border-primary/10 rounded-lg overflow-hidden"
                            >
                                {/* Session date header */}
                                <div className="px-3 py-2 bg-background/80 border-b border-primary/10">
                                    <p className="font-inter text-xs font-semibold text-primary/80 uppercase">
                                        {formatDate(session.date)}
                                    </p>
                                </div>

                                {/* Sets table */}
                                <div className="divide-y divide-primary/5">
                                    {session.sets
                                        .filter(s => s.set_type !== 'warmup')
                                        .map((set, setIndex) => (
                                            <div
                                                key={setIndex}
                                                className="grid grid-cols-3 gap-4 px-3 py-2 text-center"
                                            >
                                                <div>
                                                    <span className="font-inter text-[10px] text-primary/40 uppercase block">Set</span>
                                                    <span className="font-teko text-lg text-primary">{setIndex + 1}</span>
                                                </div>
                                                <div>
                                                    <span className="font-inter text-[10px] text-primary/40 uppercase block">Kg</span>
                                                    <span className="font-teko text-lg text-accent">{set.weight ?? '—'}</span>
                                                </div>
                                                <div>
                                                    <span className="font-inter text-[10px] text-primary/40 uppercase block">Reps</span>
                                                    <span className="font-teko text-lg text-primary">{set.reps ?? '—'}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
