'use client';

import { useRouter } from 'next/navigation';
import type { UserProgram, WorkoutProgram } from '@/types/database.types';

interface QuickStartModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeProgram?: (UserProgram & { program: WorkoutProgram }) | null;
    runningProgress?: { week: number; session: number } | null;
}

export default function QuickStartModal({
    isOpen,
    onClose,
    activeProgram,
    runningProgress
}: QuickStartModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleStartProgram = () => {
        if (activeProgram) {
            // Navigate to start workout from program
            router.push(`/workout/log?program=${activeProgram.program_id}`);
        }
        onClose();
    };

    const handleStartRunning = () => {
        router.push('/run');
        onClose();
    };

    const handleStartCustom = () => {
        router.push('/workout/log');
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed bottom-20 left-0 right-0 z-50 px-4 animate-slide-up">
                <div className="max-w-md mx-auto bg-surface border border-primary/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-accent px-4 py-3">
                        <h2 className="font-teko text-2xl uppercase tracking-wider text-background text-center">
                            Starta Träning
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="divide-y divide-primary/10">
                        {/* Program Option */}
                        {activeProgram ? (
                            <button
                                onClick={handleStartProgram}
                                className="w-full px-4 py-4 text-left hover:bg-primary/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📋</span>
                                    <div>
                                        <p className="font-inter font-semibold text-primary">
                                            Nästa pass i {activeProgram.program.name}
                                        </p>
                                        <p className="font-inter text-xs text-primary/60">
                                            Vecka {activeProgram.current_week}, Dag {activeProgram.current_day}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ) : (
                            <div className="px-4 py-4 opacity-50">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📋</span>
                                    <div>
                                        <p className="font-inter font-semibold text-primary/60">
                                            Inget aktivt program
                                        </p>
                                        <p className="font-inter text-xs text-primary/40">
                                            Välj ett program under "Program"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Running Option */}
                        <button
                            onClick={handleStartRunning}
                            className="w-full px-4 py-4 text-left hover:bg-primary/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🏃</span>
                                <div>
                                    <p className="font-inter font-semibold text-primary">
                                        Nästa löppass
                                    </p>
                                    <p className="font-inter text-xs text-primary/60">
                                        {runningProgress
                                            ? `Vecka ${runningProgress.week}, Session ${runningProgress.session}`
                                            : 'Löpcoach - Couch to 5K'
                                        }
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Custom Workout Option */}
                        <button
                            onClick={handleStartCustom}
                            className="w-full px-4 py-4 text-left hover:bg-primary/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✏️</span>
                                <div>
                                    <p className="font-inter font-semibold text-primary">
                                        Logga eget pass
                                    </p>
                                    <p className="font-inter text-xs text-primary/60">
                                        Välj övningar fritt
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Cancel */}
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 text-center font-inter text-sm text-primary/60 hover:text-primary border-t border-primary/10"
                    >
                        Avbryt
                    </button>
                </div>
            </div>
        </>
    );
}
