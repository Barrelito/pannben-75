/**
 * Rank Badge Component
 * Displays current military rank and XP progress
 */

'use client';

import { calculateRankProgress } from '@/lib/gamification';

interface RankBadgeProps {
    totalXP: number;
}

export default function RankBadge({ totalXP }: RankBadgeProps) {
    const { current, next, progress, xpToNext } = calculateRankProgress(totalXP);

    return (
        <div className="bg-surface border-2 border-primary/20 rounded-xl p-4">
            {/* Current Rank Display */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl filter drop-shadow-lg">{current.emoji}</span>
                    <div>
                        <h3 className="font-teko text-2xl uppercase tracking-wider text-accent leading-none">
                            {current.name}
                        </h3>
                        <p className="font-inter text-xs text-primary/50 font-medium">
                            {totalXP.toLocaleString()} XP
                        </p>
                    </div>
                </div>

                {next && (
                    <div className="text-right">
                        <div className="font-inter text-xs text-primary/40 uppercase tracking-wider">
                            Nästa
                        </div>
                        <div className="font-teko text-lg text-primary/60">
                            {next.name}
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {next ? (
                <>
                    <div className="h-3 bg-background rounded-full overflow-hidden mb-2 border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="font-inter text-xs text-primary/50 text-center">
                        {xpToNext} XP till {next.name}
                    </p>
                </>
            ) : (
                <div className="text-center py-2">
                    <p className="font-teko text-lg uppercase tracking-wider text-accent">
                        ⭐ MAX RANK ⭐
                    </p>
                </div>
            )}
        </div>
    );
}
