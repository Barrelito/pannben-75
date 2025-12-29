/**
 * Game Rules - Difficulty Level Definitions
 * Defines daily targets and requirements for each difficulty level
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DailyTargets {
    // Workout requirements
    workouts: number;
    requireOutdoor: boolean;
    workoutDuration: number; // in minutes, 0 = any duration

    // Hydration
    waterLiters: number;
    waterDisplay: string;

    // Reading
    readingPages: number;
    readingDisplay: string;

    // Diet rules
    dietRules: string[];
    dietDisplay: string;

    // Photo requirement
    photoRequired: boolean;
}

/**
 * Get daily targets based on difficulty level
 */
export function getDailyTargets(level: DifficultyLevel): DailyTargets {
    switch (level) {
        case 'easy':
            return {
                workouts: 1,
                requireOutdoor: false,
                workoutDuration: 0, // No duration requirement
                waterLiters: 2,
                waterDisplay: '2 liter',
                readingPages: 5,
                readingDisplay: '5 sidor',
                dietRules: [
                    'Inget godis/skräpmat (Vardagar)',
                    'Alkohol tillåten',
                ],
                dietDisplay: 'Inget godis/skräpmat (Vardagar)',
                photoRequired: false, // Photo is OPTIONAL on Easy
            };

        case 'medium':
            return {
                workouts: 2,
                requireOutdoor: true,
                workoutDuration: 0, // No specific duration, but 1 must be outdoor
                waterLiters: 3,
                waterDisplay: '3 liter',
                readingPages: 10,
                readingDisplay: '10 sidor',
                dietRules: [
                    'Inget socker/skräpmat (Alla dagar)',
                    'Ingen alkohol (Vardagar)',
                ],
                dietDisplay: 'Inget socker/skräpmat',
                photoRequired: true,
            };

        case 'hard':
            return {
                workouts: 2,
                requireOutdoor: true,
                workoutDuration: 45, // Each workout must be 45 min
                waterLiters: 4,
                waterDisplay: '4 liter',
                readingPages: 10,
                readingDisplay: '10 sidor · Ingen fiction',
                dietRules: [
                    'Strikt diet',
                    'Inga undantag',
                    'Ingen alkohol',
                    'Inga cheat meals',
                ],
                dietDisplay: 'Inga undantag',
                photoRequired: true,
            };
    }
}

/**
 * Get level display name
 */
export function getLevelDisplayName(level: DifficultyLevel): string {
    switch (level) {
        case 'easy':
            return 'GNISTAN';
        case 'medium':
            return 'GLÖDEN';
        case 'hard':
            return 'PANNBEN';
    }
}

/**
 * Get level description
 */
export function getLevelDescription(level: DifficultyLevel): string {
    switch (level) {
        case 'easy':
            return 'Börja försiktigt. Bygg disciplin utan att överväldigas.';
        case 'medium':
            return 'Utmana dig själv. Balansera träning, kost och återhämtning.';
        case 'hard':
            return 'Hårdkärnan. 75 dagar av totalfokus, ingen nåd.';
    }
}

/**
 * Get level emoji
 */
export function getLevelEmoji(level: DifficultyLevel): string {
    switch (level) {
        case 'easy':
            return '🔥';
        case 'medium':
            return '💪';
        case 'hard':
            return '⚡';
    }
}
