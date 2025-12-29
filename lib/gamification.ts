/**
 * Gamification System - XP & Ranks
 * Unified experience point tracking and military rank progression
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// XP Values Configuration
export const XP_VALUES = {
    DAILY_BASE: 100,         // Base XP for completing a day
    BONUS_WORKOUT: 20,       // Extra XP for bonus workouts
    LEVEL_BONUS: {
        easy: 0,             // GNISTAN: No bonus
        medium: 25,          // GLÖDEN: +25 XP
        hard: 50,            // PANNBEN: +50 XP
    }
} as const;

// Military Rank Progression
export interface Rank {
    minXP: number;
    name: string;
    emoji: string;
}

export const RANKS: Rank[] = [
    { minXP: 0, name: 'Rekryt', emoji: '🪖' },
    { minXP: 500, name: 'Menig', emoji: '⭐' },
    { minXP: 1500, name: 'Korpral', emoji: '⭐⭐' },
    { minXP: 3000, name: 'Sergeant', emoji: '🎖️' },
    { minXP: 5000, name: 'Fänrik', emoji: '🎖️🎖️' },
    { minXP: 7500, name: 'General', emoji: '⭐⭐⭐' },
];

/**
 * Calculate the current rank based on total XP
 */
export function calculateRank(totalXP: number): Rank {
    // Find the highest rank the user qualifies for
    let currentRank = RANKS[0];

    for (const rank of RANKS) {
        if (totalXP >= rank.minXP) {
            currentRank = rank;
        } else {
            break;
        }
    }

    return currentRank;
}

/**
 * Get the next rank in progression
 */
export function getNextRank(totalXP: number): Rank | null {
    const currentRankIndex = RANKS.findIndex(rank => totalXP < rank.minXP) - 1;
    const nextIndex = Math.max(0, currentRankIndex) + 1;

    return nextIndex < RANKS.length ? RANKS[nextIndex] : null;
}

/**
 * Calculate XP progress to next rank
 */
export function calculateRankProgress(totalXP: number): {
    current: Rank;
    next: Rank | null;
    progress: number; // 0-100
    xpToNext: number;
} {
    const current = calculateRank(totalXP);
    const next = getNextRank(totalXP);

    if (!next) {
        return {
            current,
            next: null,
            progress: 100,
            xpToNext: 0,
        };
    }

    const currentMin = current.minXP;
    const nextMin = next.minXP;
    const range = nextMin - currentMin;
    const earned = totalXP - currentMin;
    const progress = Math.min((earned / range) * 100, 100);

    return {
        current,
        next,
        progress,
        xpToNext: nextMin - totalXP,
    };
}

/**
 * Calculate total XP for a completed day
 */
export function calculateDailyXP(
    level: DifficultyLevel,
    bonusWorkouts: number = 0
): number {
    const base = XP_VALUES.DAILY_BASE;
    const levelBonus = XP_VALUES.LEVEL_BONUS[level];
    const workoutBonus = bonusWorkouts * XP_VALUES.BONUS_WORKOUT;

    return base + levelBonus + workoutBonus;
}
