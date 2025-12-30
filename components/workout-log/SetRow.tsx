'use client';

import { useState, useRef, useEffect } from 'react';
import type { WorkoutSet } from '@/types/database.types';

interface SetRowProps {
    set: WorkoutSet;
    onUpdate: (weight: number | null, reps: number | null, completed: boolean) => void;
    onDelete: () => void;
}

export default function SetRow({ set, onUpdate, onDelete }: SetRowProps) {
    const [weight, setWeight] = useState<string>(set.weight?.toString() || '');
    const [reps, setReps] = useState<string>(set.reps?.toString() || '');
    const [isCompleted, setIsCompleted] = useState(set.completed);
    const [showMenu, setShowMenu] = useState(false);
    const weightRef = useRef<HTMLInputElement>(null);
    const repsRef = useRef<HTMLInputElement>(null);

    // Sync state with props
    useEffect(() => {
        setWeight(set.weight?.toString() || '');
        setReps(set.reps?.toString() || '');
        setIsCompleted(set.completed);
    }, [set.weight, set.reps, set.completed]);

    const handleUpdate = (newWeight: string, newReps: string, newCompleted: boolean) => {
        const w = newWeight ? parseFloat(newWeight) : null;
        const r = newReps ? parseInt(newReps) : null;
        onUpdate(w, r, newCompleted);
    };

    const handleWeightBlur = () => {
        handleUpdate(weight, reps, isCompleted);
    };

    const handleRepsBlur = () => {
        handleUpdate(weight, reps, isCompleted);
    };

    const toggleCompleted = () => {
        const newCompleted = !isCompleted;
        setIsCompleted(newCompleted);
        handleUpdate(weight, reps, newCompleted);
    };

    const handleWeightKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            repsRef.current?.focus();
        }
    };

    const handleRepsKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            repsRef.current?.blur();
            // Optional: Mark as completed on Enter in reps?
            // toggleCompleted();
        }
    };

    const getSetTypeLabel = () => {
        switch (set.set_type) {
            case 'warmup':
                return <span className="text-orange-400 text-xs">🔥</span>;
            case 'dropset':
                return <span className="text-blue-400 text-xs">↓</span>;
            case 'failure':
                return <span className="text-red-400 text-xs">⚡</span>;
            case 'amrap':
                return <span className="text-purple-400 text-xs">∞</span>;
            default:
                return null;
        }
    };

    return (
        <div className={`grid grid-cols-5 gap-2 px-4 py-2 items-center relative transition-colors ${isCompleted ? 'bg-green-900/10' : ''}`}>
            {/* Set Number */}
            <div className="flex items-center justify-center gap-1">
                {getSetTypeLabel()}
                <span className={`font-teko text-lg ${isCompleted ? 'text-green-500' : 'text-primary/60'}`}>
                    {set.set_number}
                </span>
                {set.is_pr && <span className="text-yellow-400 text-xs">🏆</span>}
            </div>

            {/* Weight Input */}
            <input
                ref={weightRef}
                type="number"
                inputMode="decimal"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onBlur={handleWeightBlur}
                onKeyDown={handleWeightKeyDown}
                className={`w-full bg-background border px-2 py-1 text-center font-inter text-sm focus:border-accent focus:outline-none ${isCompleted
                    ? 'border-green-500/30 text-green-100 bg-green-900/20'
                    : 'border-primary/20 text-primary'
                    }`}
                placeholder="—"
            />

            {/* Reps Input */}
            <input
                ref={repsRef}
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                onBlur={handleRepsBlur}
                onKeyDown={handleRepsKeyDown}
                className={`w-full bg-background border px-2 py-1 text-center font-inter text-sm focus:border-accent focus:outline-none ${isCompleted
                    ? 'border-green-500/30 text-green-100 bg-green-900/20'
                    : 'border-primary/20 text-primary'
                    }`}
                placeholder="—"
            />

            {/* Completed Checkbox */}
            <div className="flex justify-center">
                <button
                    onClick={toggleCompleted}
                    className={`w-8 h-8 flex items-center justify-center border-2 rounded transition-all ${isCompleted
                        ? 'bg-green-500 border-green-500 text-background'
                        : 'border-primary/20 text-transparent hover:border-green-500/50'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </button>
            </div>

            {/* Menu Button */}
            <div className="flex justify-center">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-primary/40 hover:text-primary p-1"
                >
                    ⋮
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-4 top-full z-50 bg-surface border border-primary/20 shadow-lg min-w-[150px]">
                            <button
                                onClick={() => {
                                    onDelete();
                                    setShowMenu(false);
                                }}
                                className="block w-full px-4 py-3 text-left font-inter text-sm text-red-500 hover:bg-red-500/10"
                            >
                                Ta bort set
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
