/**
 * Scale Conversion Utilities
 * Converts between UI scale (0-2) and Database scale (1-10)
 */

import type { ScoreUI } from '@/types/logic.types';

/**
 * Convert UI score (0-2) to Database score (1-10)
 * 
 * Mapping:
 * - 0 (Bad)    → 1-3   (Average: 2)
 * - 1 (Okay)   → 4-7   (Average: 5)
 * - 2 (Good)   → 8-10  (Average: 9)
 */
export function uiToDb(score: ScoreUI): number {
    const mapping: Record<ScoreUI, number> = {
        0: 2,  // Bad → Low score
        1: 5,  // Okay → Mid score
        2: 9,  // Good → High score
    };

    return mapping[score];
}

/**
 * Convert Database score (1-10) to UI score (0-2)
 * 
 * Mapping:
 * - 1-3   → 0 (Bad)
 * - 4-7   → 1 (Okay)
 * - 8-10  → 2 (Good)
 */
export function dbToUi(score: number): ScoreUI {
    if (score <= 3) return 0;
    if (score <= 7) return 1;
    return 2;
}

/**
 * Convert all morning scores from UI to DB format
 */
export function convertScoresToDb(scores: Record<string, ScoreUI>): Record<string, number> {
    const result: Record<string, number> = {};

    for (const [key, value] of Object.entries(scores)) {
        result[key] = uiToDb(value);
    }

    return result;
}

/**
 * Convert all morning scores from DB to UI format
 */
export function convertScoresToUi(scores: Record<string, number | null>): Record<string, ScoreUI> {
    const result: Record<string, ScoreUI> = {};

    for (const [key, value] of Object.entries(scores)) {
        result[key] = value !== null ? dbToUi(value) : 0;
    }

    return result;
}
