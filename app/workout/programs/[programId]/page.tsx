/**
 * Program Detail Page
 * View program details and start workouts
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import { getProgram, getUserPrograms } from '@/lib/actions/workout';

interface ProgramDetailPageProps {
    params: Promise<{ programId: string }>;
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

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
    const { programId } = await params;
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch program with days and exercises
    const { data: program, error } = await getProgram(programId);

    if (error || !program) {
        notFound();
    }

    // Check if user is subscribed
    const { data: userPrograms } = await getUserPrograms();
    const userProgram = userPrograms?.find(up => up.program_id === programId);

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background">
                <div className="p-6 pb-20">
                    <ServerHeader />

                    {/* Back Link */}
                    <Link
                        href="/workout/programs"
                        className="inline-flex items-center gap-2 font-inter text-sm text-primary/60 hover:text-primary mb-4"
                    >
                        ← Tillbaka
                    </Link>

                    {/* Program Header */}
                    <div className="mb-6">
                        <div className="flex items-start gap-2 flex-wrap mb-2">
                            <h1 className="font-teko text-4xl uppercase tracking-wider text-accent">
                                {program.name}
                            </h1>
                            {program.is_premium && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-inter uppercase">
                                    Premium
                                </span>
                            )}
                        </div>
                        <p className="font-inter text-primary/80 mb-4">
                            {program.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-sm font-inter text-primary/60">
                            <span className="flex items-center gap-1">
                                <span>📊</span> {DIFFICULTY_LABELS[program.difficulty]}
                            </span>
                            <span className="flex items-center gap-1">
                                <span>🎯</span> {GOAL_LABELS[program.goal]}
                            </span>
                            <span className="flex items-center gap-1">
                                <span>📅</span> {program.days_per_week} dagar/vecka
                            </span>
                            {program.duration_weeks && (
                                <span className="flex items-center gap-1">
                                    <span>⏱️</span> {program.duration_weeks} veckor
                                </span>
                            )}
                        </div>
                    </div>

                    {/* User Progress (if subscribed) */}
                    {userProgram && (
                        <div className="bg-surface border-2 border-accent p-4 mb-6">
                            <h3 className="font-teko text-lg uppercase tracking-wider text-accent mb-2">
                                Din framgång
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-center mb-4">
                                <div>
                                    <p className="font-teko text-2xl text-primary">{userProgram.current_week}</p>
                                    <p className="font-inter text-xs text-primary/60 uppercase">Vecka</p>
                                </div>
                                <div>
                                    <p className="font-teko text-2xl text-primary">{userProgram.current_day}</p>
                                    <p className="font-inter text-xs text-primary/60 uppercase">Dag</p>
                                </div>
                                <div>
                                    <p className="font-teko text-2xl text-primary">{userProgram.completed_days}</p>
                                    <p className="font-inter text-xs text-primary/60 uppercase">Avklarade</p>
                                </div>
                            </div>
                            {program.duration_weeks && (
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent transition-all"
                                        style={{
                                            width: `${(userProgram.completed_days / (program.days_per_week * program.duration_weeks)) * 100}%`,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Program Days */}
                    <div className="space-y-4">
                        <h2 className="font-teko text-xl uppercase tracking-wider text-primary/60">
                            PROGRAMDAGAR
                        </h2>

                        {program.days.length === 0 ? (
                            <div className="text-center py-8 bg-surface border border-primary/20">
                                <p className="font-inter text-primary/40">Inga dagar konfigurerade ännu</p>
                            </div>
                        ) : (
                            program.days.map((day) => {
                                const isCurrentDay = userProgram && day.day_number === userProgram.current_day;

                                return (
                                    <div
                                        key={day.id}
                                        className={`bg-surface border p-4 ${isCurrentDay ? 'border-accent' : 'border-primary/20'}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-teko text-lg uppercase tracking-wider text-primary">
                                                    Dag {day.day_number}{day.name && `: ${day.name}`}
                                                </h3>
                                                {day.description && (
                                                    <p className="font-inter text-xs text-primary/60">{day.description}</p>
                                                )}
                                            </div>
                                            {isCurrentDay && (
                                                <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-inter uppercase">
                                                    Nästa
                                                </span>
                                            )}
                                        </div>

                                        {/* Exercises */}
                                        {day.exercises && day.exercises.length > 0 ? (
                                            <ul className="space-y-2">
                                                {day.exercises
                                                    .sort((a, b) => a.order_index - b.order_index)
                                                    .map((programExercise) => (
                                                        <li
                                                            key={programExercise.id}
                                                            className="flex items-center justify-between py-2 border-t border-primary/10"
                                                        >
                                                            <span className="font-inter text-sm text-primary">
                                                                {programExercise.exercise?.name || 'Övning'}
                                                            </span>
                                                            <span className="font-inter text-xs text-primary/50">
                                                                {programExercise.sets} × {programExercise.reps_min === programExercise.reps_max
                                                                    ? programExercise.reps_min
                                                                    : `${programExercise.reps_min}-${programExercise.reps_max}`}
                                                            </span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p className="font-inter text-xs text-primary/40">Inga övningar</p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </MobileContainer>
    );
}
