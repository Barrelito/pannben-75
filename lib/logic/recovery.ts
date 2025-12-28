/**
 * Recovery Status Algorithm for Pannben 75
 * Determines if user should train hard, take caution, or rest based on morning check-in
 */

import type { MorningScoresUI, RecoveryResult, RecoveryStatus } from '@/types/logic.types';

/**
 * Calculate recovery status from morning check-in scores
 * 
 * Logic:
 * - RED: Body injury risk (0) OR Sleep deprivation (0)
 * - YELLOW: High stress (0) OR Total score < 6
 * - GREEN: All other cases
 * 
 * @param scores - Morning check-in scores (0-2 scale)
 * @returns Recovery result with status, message, and total score
 */
export function calculateRecoveryStatus(scores: MorningScoresUI): RecoveryResult {
    const { sleep, body, energy, stress, motivation } = scores;

    // Calculate total score (max 10)
    const totalScore = sleep + body + energy + stress + motivation;

    // RED: Critical - Injury risk or sleep deprivation
    if (body === 0 || sleep === 0) {
        return {
            status: 'RED' as RecoveryStatus,
            message: 'Kroppen signalerar fara. Gå, spring inte.',
            totalScore,
        };
    }

    // YELLOW: Caution - High stress or low overall score
    if (stress === 0 || totalScore < 6) {
        return {
            status: 'YELLOW' as RecoveryStatus,
            message: 'Pannbenet är redo, men systemet är slitet. Var smart.',
            totalScore,
        };
    }

    // GREEN: Go hard
    return {
        status: 'GREEN' as RecoveryStatus,
        message: 'Du är en maskin. Kör hårt.',
        totalScore,
    };
}

/**
 * Get recovery status color for UI
 */
export function getRecoveryColor(status: RecoveryStatus): string {
    const colors = {
        GREEN: '#15803d',   // status-green
        YELLOW: '#a16207',  // status-yellow
        RED: '#b91c1c',     // status-red
    };

    return colors[status];
}

/**
 * Get recovery status emoji
 */
export function getRecoveryEmoji(status: RecoveryStatus): string {
    const emojis = {
        GREEN: '💪',
        YELLOW: '⚠️',
        RED: '🛑',
    };

    return emojis[status];
}
