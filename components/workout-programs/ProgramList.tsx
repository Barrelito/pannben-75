'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WorkoutProgram, UserProgram } from '@/types/database.types';
import { subscribeToProgram, unsubscribeFromProgram } from '@/lib/actions/workout';

interface ProgramListProps {
    programs: WorkoutProgram[];
    userPrograms: (UserProgram & { program: WorkoutProgram })[];
}

const DIFFICULTY_LABELS: Record<string, string> = {
    beginner: 'Nybörjare',
    intermediate: 'Medel',
    advanced: 'Avancerad',
};

const GOAL_LABELS: Record<string, string> = {
    strength: 'Styrka',
    hypertrophy: 'Muskelbyggnad',
    powerlifting: 'Styrkelyft',
    general: 'Allmän',
    endurance: 'Uthållighet',
};

export default function ProgramList({ programs, userPrograms }: ProgramListProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    // Get IDs of programs user is currently subscribed to
    const subscribedProgramIds = new Set(userPrograms.map(up => up.program_id));

    const handleSubscribe = async (programId: string) => {
        setIsLoading(programId);
        const { error } = await subscribeToProgram(programId);
        if (error) {
            alert(error);
        } else {
            router.refresh();
        }
        setIsLoading(null);
    };

    const handleUnsubscribe = async (userProgramId: string) => {
        if (!confirm('Vill du sluta följa detta program?')) return;

        setIsLoading(userProgramId);
        const { error } = await unsubscribeFromProgram(userProgramId);
        if (error) {
            alert(error);
        } else {
            router.refresh();
        }
        setIsLoading(null);
    };

    const getUserProgramForProgram = (programId: string) => {
        return userPrograms.find(up => up.program_id === programId);
    };

    return (
        <div className="space-y-6">
            {/* Active Programs */}
            {userPrograms.filter(up => up.status === 'active').length > 0 && (
                <div>
                    <h2 className="font-teko text-xl uppercase tracking-wider text-primary/60 mb-3">
                        AKTIVA PROGRAM
                    </h2>
                    <div className="space-y-3">
                        {userPrograms
                            .filter(up => up.status === 'active')
                            .map((userProgram) => (
                                <div
                                    key={userProgram.id}
                                    className="bg-surface border-2 border-accent p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-teko text-xl uppercase tracking-wider text-accent">
                                                {userProgram.program.name}
                                            </h3>
                                            <p className="font-inter text-xs text-primary/60">
                                                Vecka {userProgram.current_week} • Dag {userProgram.current_day}
                                            </p>
                                        </div>
                                        <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-inter uppercase">
                                            Aktiv
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-inter text-primary/60 mb-1">
                                            <span>{userProgram.completed_days} dagar avklarade</span>
                                            {userProgram.program.duration_weeks && (
                                                <span>
                                                    {userProgram.program.days_per_week * userProgram.program.duration_weeks} totalt
                                                </span>
                                            )}
                                        </div>
                                        <div className="h-2 bg-background rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent transition-all"
                                                style={{
                                                    width: userProgram.program.duration_weeks
                                                        ? `${(userProgram.completed_days / (userProgram.program.days_per_week * userProgram.program.duration_weeks)) * 100}%`
                                                        : '0%',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/workout/programs/${userProgram.program_id}`)}
                                            className="flex-1 px-4 py-2 bg-accent text-background font-inter text-sm uppercase tracking-wider"
                                        >
                                            Visa program
                                        </button>
                                        <button
                                            onClick={() => handleUnsubscribe(userProgram.id)}
                                            disabled={isLoading === userProgram.id}
                                            className="px-4 py-2 border border-primary/20 text-primary/60 font-inter text-sm uppercase tracking-wider hover:border-red-500 hover:text-red-500 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* All Available Programs */}
            <div>
                <h2 className="font-teko text-xl uppercase tracking-wider text-primary/60 mb-3">
                    ALLA PROGRAM
                </h2>
                <div className="space-y-3">
                    {programs.map((program) => {
                        const isSubscribed = subscribedProgramIds.has(program.id);
                        const userProgram = getUserProgramForProgram(program.id);

                        return (
                            <div
                                key={program.id}
                                className={`bg-surface border p-4 ${isSubscribed ? 'border-accent/40' : 'border-primary/20'}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-teko text-xl uppercase tracking-wider text-primary">
                                                {program.name}
                                            </h3>
                                            {program.is_premium && (
                                                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] uppercase font-inter">
                                                    Premium
                                                </span>
                                            )}
                                            {isSubscribed && (
                                                <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] uppercase font-inter">
                                                    Följer
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-inter text-sm text-primary/70 mt-1 line-clamp-2">
                                            {program.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex flex-wrap gap-3 text-xs font-inter text-primary/50 mb-4">
                                    <span>{DIFFICULTY_LABELS[program.difficulty] || program.difficulty}</span>
                                    <span>•</span>
                                    <span>{GOAL_LABELS[program.goal] || program.goal}</span>
                                    <span>•</span>
                                    <span>{program.days_per_week} dagar/vecka</span>
                                    {program.duration_weeks && (
                                        <>
                                            <span>•</span>
                                            <span>{program.duration_weeks} veckor</span>
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push(`/workout/programs/${program.id}`)}
                                        className="flex-1 px-4 py-2 border border-primary/20 text-primary font-inter text-sm uppercase tracking-wider hover:border-accent hover:text-accent transition-colors"
                                    >
                                        Visa detaljer
                                    </button>
                                    {!isSubscribed ? (
                                        <button
                                            onClick={() => handleSubscribe(program.id)}
                                            disabled={isLoading === program.id}
                                            className="px-4 py-2 bg-accent text-background font-inter text-sm uppercase tracking-wider disabled:opacity-50"
                                        >
                                            {isLoading === program.id ? '...' : 'Följ'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUnsubscribe(userProgram!.id)}
                                            disabled={isLoading === userProgram?.id}
                                            className="px-4 py-2 border border-accent text-accent font-inter text-sm uppercase tracking-wider hover:bg-accent hover:text-background transition-colors"
                                        >
                                            Sluta följa
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
