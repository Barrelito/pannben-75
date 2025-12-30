'use client';

import Link from 'next/link';
import { useRunningProgress } from '@/hooks/useRunningProgress';
import { RUNNING_PROGRAM } from '@/lib/data/runningProgram';

export default function RunningProgressCard() {
    const { completedSessions, isLoaded } = useRunningProgress();

    // Find next uncompleted session
    const findNextSession = () => {
        for (const week of RUNNING_PROGRAM) {
            for (const session of week.sessions) {
                if (!completedSessions.includes(session.id)) {
                    return { week, session };
                }
            }
        }
        return null; // All sessions completed!
    };

    const nextSession = findNextSession();
    const totalSessions = RUNNING_PROGRAM.reduce((acc, w) => acc + w.sessions.length, 0);
    const completedCount = completedSessions.length;
    const progressPercent = (completedCount / totalSessions) * 100;

    if (!isLoaded) {
        return (
            <div className="bg-surface border border-primary/20 p-4 animate-pulse">
                <div className="h-6 bg-primary/10 rounded w-32 mb-2" />
                <div className="h-4 bg-primary/10 rounded w-48" />
            </div>
        );
    }

    // All sessions completed
    if (!nextSession) {
        return (
            <div className="bg-surface border border-accent/50 p-4">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                        <h3 className="font-teko text-xl text-accent">LÖPCOACH SLUTFÖRD!</h3>
                        <p className="font-inter text-xs text-primary/60">
                            Grattis! Du har klarat alla 9 veckor!
                        </p>
                    </div>
                </div>
                <Link
                    href="/run"
                    className="block w-full py-2 bg-primary/10 text-primary font-inter text-sm uppercase text-center hover:bg-primary/20"
                >
                    Se programmet
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-primary/20 p-4">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🏃</span>
                    <div>
                        <h3 className="font-teko text-xl text-primary">LÖPCOACH</h3>
                        <p className="font-inter text-xs text-primary/60">
                            Vecka {nextSession.week.weekNumber}, Pass {nextSession.session.sessionNumber}
                        </p>
                    </div>
                </div>
                <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-inter">
                    {completedCount}/{totalSessions}
                </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
                <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Session info */}
            <p className="font-inter text-xs text-primary/50 mb-3">
                {nextSession.week.theme}
            </p>

            <Link
                href={`/run/session/${nextSession.session.id}`}
                className="block w-full py-2 bg-accent text-background font-inter font-semibold text-sm uppercase text-center"
            >
                Starta nästa pass
            </Link>
        </div>
    );
}
