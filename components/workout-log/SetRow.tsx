'use client';

import { useState, useRef, useEffect } from 'react';
import type { WorkoutSet } from '@/types/database.types';

interface SetRowProps {
    set: WorkoutSet;
    onUpdate: (weight: number | null, reps: number | null) => void;
    onDelete: () => void;
}

export default function SetRow({ set, onUpdate, onDelete }: SetRowProps) {
    const [weight, setWeight] = useState<string>(set.weight?.toString() || '');
    const [reps, setReps] = useState<string>(set.reps?.toString() || '');
    const [showMenu, setShowMenu] = useState(false);
    const weightRef = useRef<HTMLInputElement>(null);
    const repsRef = useRef<HTMLInputElement>(null);

    // Sync state with props
    useEffect(() => {
        setWeight(set.weight?.toString() || '');
        setReps(set.reps?.toString() || '');
    }, [set.weight, set.reps]);

    const handleWeightBlur = () => {
        const newWeight = weight ? parseFloat(weight) : null;
        const newReps = reps ? parseInt(reps) : null;
        if (newWeight !== set.weight || newReps !== set.reps) {
            onUpdate(newWeight, newReps);
        }
    };

    const handleRepsBlur = () => {
        const newWeight = weight ? parseFloat(weight) : null;
        const newReps = reps ? parseInt(reps) : null;
        if (newWeight !== set.weight || newReps !== set.reps) {
            onUpdate(newWeight, newReps);
        }
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
        <div className="grid grid-cols-4 gap-2 px-4 py-2 items-center relative">
            {/* Set Number */}
            <div className="flex items-center justify-center gap-1">
                {getSetTypeLabel()}
                <span className="font-teko text-lg text-primary/60">{set.set_number}</span>
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
                className="bg-background border border-primary/20 px-2 py-1 text-center font-inter text-sm text-primary focus:border-accent focus:outline-none"
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
                className="bg-background border border-primary/20 px-2 py-1 text-center font-inter text-sm text-primary focus:border-accent focus:outline-none"
                placeholder="—"
            />

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
                        <div className="absolute right-4 top-full z-50 bg-surface border border-primary/20 shadow-lg">
                            <button
                                onClick={() => {
                                    onDelete();
                                    setShowMenu(false);
                                }}
                                className="block w-full px-4 py-2 text-left font-inter text-sm text-red-500 hover:bg-red-500/10"
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
