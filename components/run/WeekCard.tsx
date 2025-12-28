/**
 * Week Card Component
 * Displays a week overview with sessions
 */

'use client';

import { useRouter } from 'next/navigation';
import type { Week } from '@/lib/data/runningProgram';

interface WeekCardProps {
    week: Week;
}

export default function WeekCard({ week }: WeekCardProps) {
    const router = useRouter();

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
                {week.sessions.map((session) => (
                    <button
                        key={session.id}
                        onClick={() => router.push(`/run/session/${session.id}`)}
                        className="w-full bg-background border border-primary/10 p-4 hover:border-accent transition-colors flex justify-between items-center group"
                    >
                        <div className="text-left">
                            <p className="font-inter font-bold text-primary group-hover:text-accent transition-colors">
                                Pass {session.sessionNumber}
                            </p>
                            <p className="font-inter text-xs text-primary/60">
                                {session.totalMinutes} minuter
                            </p>
                        </div>
                        <div className="text-2xl group-hover:scale-110 transition-transform">
                            🏃
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
