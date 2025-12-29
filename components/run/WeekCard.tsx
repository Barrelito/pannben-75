/**
 * Week Card Component
 * Displays a week overview with sessions
 */

'use client';

import { useRouter } from 'next/navigation';
import type { Week } from '@/lib/data/runningProgram';
import { useRunningProgress } from '@/hooks/useRunningProgress';

interface WeekCardProps {
    week: Week;
}

export default function WeekCard({ week }: WeekCardProps) {
    const router = useRouter();
    const { isSessionComplete } = useRunningProgress();

    return (
        <div className="bg-surface border-2 border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent flex items-center justify-center">
                    <span className="font-teko text-2xl text-background">
                        {week.weekNumber}
                    </span>
                </div>
                <div>
                    <h2 className="font-teko text-2xl uppercase text-accent">
                        Vecka {week.weekNumber}
                    </h2>
                    <p className="font-inter text-sm text-primary/60">
                        {week.theme}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {week.sessions.map((session) => {
                    const isComplete = isSessionComplete(session.id);

                    return (
                        <button
                            key={session.id}
                            onClick={() => router.push(`/run/session/${session.id}`)}
                            className={`w-full border p-4 transition-colors flex justify-between items-center group ${isComplete
                                    ? 'bg-status-green/10 border-status-green'
                                    : 'bg-background border-primary/10 hover:border-accent'
                                }`}
                        >
                            <div className="text-left">
                                <p className={`font-inter font-bold transition-colors ${isComplete ? 'text-status-green' : 'text-primary group-hover:text-accent'
                                    }`}>
                                    Pass {session.sessionNumber}
                                    {isComplete && <span className="ml-2">✓</span>}
                                </p>
                                <p className="font-inter text-xs text-primary/60">
                                    {session.totalMinutes} minuter
                                </p>
                            </div>
                            <div className="text-2xl group-hover:scale-110 transition-transform">
                                {isComplete ? '✅' : '🏃'}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

