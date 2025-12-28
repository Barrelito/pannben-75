/**
 * Active Session Component
 * Smart Coach with phase progression (Warmup → Main → Cooldown)
 */

'use client';

import { useState } from 'react';
import type { UseWorkoutTimerResult } from '@/hooks/useWorkoutTimer';
import type { WorkoutTrack } from '@/types/database.types';

interface ActiveSessionProps {
    timer: UseWorkoutTimerResult;
    track: WorkoutTrack;
    structure: any;
    onComplete: () => void;
}

type Phase = 'warmup' | 'main' | 'cooldown';

export default function ActiveSession({
    timer,
    track,
    structure,
    onComplete,
}: ActiveSessionProps) {
    const [currentPhase, setCurrentPhase] = useState<Phase>('warmup');
    const [rounds, setRounds] = useState(1);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const handlePhaseComplete = () => {
        if (currentPhase === 'warmup') {
            setCurrentPhase('main');
        } else if (currentPhase === 'main') {
            setCurrentPhase('cooldown');
        } else {
            // Cooldown done - show completion modal
            setShowCompletionModal(true);
        }
    };

    const handleAddRound = () => {
        setRounds(prev => prev + 1);
    };

    const getPhaseText = (phase: Phase): string => {
        const labels = {
            warmup: 'UPPVÄRMNING',
            main: 'HUVUDPASS',
            cooldown: 'NEDVARVNING',
        };
        return labels[phase];
    };

    const getCurrentInstructions = (): string => {
        if (!structure) return 'Inga instruktioner';

        if (currentPhase === 'warmup') return structure.warmup || 'Värm upp';
        if (currentPhase === 'main') return structure.main || 'Huvudpass';
        if (currentPhase === 'cooldown') return structure.cooldown || 'Sträck ut';

        return '';
    };

    const handleQuitWithoutSaving = () => {
        window.location.href = '/dashboard';
    };

    return (
        <>
            <div className="min-h-screen bg-background flex flex-col">
                {/* Header */}
                <div className="p-6 border-b-2 border-primary/20">
                    <h1 className="font-teko text-3xl uppercase tracking-wider text-accent text-center">
                        {track.title}
                    </h1>
                </div>

                {/* Big Timer */}
                <div className="p-8 border-b-2 border-primary/20">
                    <div className="text-center">
                        <div className="font-teko text-9xl text-accent leading-none">
                            {timer.elapsedFormatted}
                        </div>
                        <div className="font-inter text-sm text-primary/60 uppercase tracking-wider mt-2">
                            TILL 45:00: {timer.remainingTo45Formatted}
                        </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex gap-3 justify-center mt-6">
                        {timer.isRunning && !timer.isPaused && (
                            <button
                                onClick={timer.pause}
                                className="px-6 py-3 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent transition-all"
                            >
                                ⏸ PAUS
                            </button>
                        )}

                        {timer.isPaused && (
                            <button
                                onClick={timer.resume}
                                className="px-6 py-3 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                            >
                                ▶ FORTSÄTT
                            </button>
                        )}
                    </div>
                </div>

                {/* The Coach */}
                <div className="flex-1 p-6 space-y-6">
                    {/* Phase Indicator */}
                    <div className="bg-surface border-2 border-accent p-4 text-center">
                        <div className="font-inter text-xs uppercase tracking-wider text-primary/60 mb-1">
                            FAS
                        </div>
                        <div className="font-teko text-3xl uppercase tracking-wider text-accent">
                            {getPhaseText(currentPhase)}
                        </div>
                    </div>

                    {/* Instructions Card */}
                    <div className="bg-surface border-2 border-primary/20 p-6">
                        <p className="font-inter text-base text-primary leading-relaxed whitespace-pre-wrap">
                            {getCurrentInstructions()}
                        </p>
                    </div>

                    {/* Round Tracker (Main phase only) */}
                    {currentPhase === 'main' && (
                        <div className="bg-surface border-2 border-accent p-6">
                            <div className="text-center mb-4">
                                <div className="font-inter text-xs uppercase tracking-wider text-primary/60 mb-2">
                                    RUNDA
                                </div>
                                <div className="font-teko text-7xl text-accent leading-none">
                                    {rounds}
                                </div>
                            </div>
                            <button
                                onClick={handleAddRound}
                                className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                            >
                                + RUNDA KLAR
                            </button>
                        </div>
                    )}

                    {/* Phase Complete Button */}
                    <button
                        onClick={handlePhaseComplete}
                        className="w-full px-8 py-4 bg-status-green text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-status-green hover:bg-transparent hover:text-status-green transition-all"
                    >
                        ✓ {currentPhase === 'cooldown' ? 'AVSLUTA PASS' : `${getPhaseText(currentPhase)} KLAR`}
                    </button>
                </div>
            </div>

            {/* Completion Modal */}
            {showCompletionModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
                    <div className="bg-surface border-2 border-accent p-8 max-w-sm w-full">
                        {timer.canComplete ? (
                            // 45 minutes reached - normal completion
                            <>
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h2 className="font-teko text-4xl uppercase tracking-wider text-accent mb-2">
                                        BRA JOBBAT!
                                    </h2>
                                    <p className="font-inter text-sm text-primary/80">
                                        Rundor genomförda: <span className="text-accent font-semibold">{rounds}</span>
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={onComplete}
                                        className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                                    >
                                        ✓ REGISTRERA PASS
                                    </button>

                                    <button
                                        onClick={() => setShowCompletionModal(false)}
                                        className="w-full px-8 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all"
                                    >
                                        ← TILLBAKA
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Under 45 minutes - warning
                            <>
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-4">⚠️</div>
                                    <h2 className="font-teko text-3xl uppercase tracking-wider text-status-red mb-4">
                                        OBS! TIMERN HAR INTE NÅTT 45 MIN
                                    </h2>
                                    <p className="font-inter text-sm text-primary/80 mb-2">
                                        Återstående tid: <span className="text-accent font-semibold">{timer.remainingTo45Formatted}</span>
                                    </p>
                                    <p className="font-inter text-sm text-primary/80">
                                        Passet kommer <span className="text-status-red font-semibold">inte</span> räknas som avklarat om du avslutar nu.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowCompletionModal(false)}
                                        className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                                    >
                                        ⏱ FORTSÄTT TRÄNA
                                    </button>

                                    <button
                                        onClick={handleQuitWithoutSaving}
                                        className="w-full px-8 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-status-red hover:text-status-red transition-all"
                                    >
                                        ✗ AVSLUTA UTAN ATT SPARA
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
