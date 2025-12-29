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
    workoutLabel: string; // Display label for the workout rule
    workoutSublabel: string; // Sub-label for the workout rule
    weeklyHardWorkouts: number; // Weekly hard workout requirement (0 for Easy/Hard)

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
                workoutDuration: 30, // 30 min movement
                workoutLabel: 'DAGENS RÖRELSE',
                workoutSublabel: '30 min · Promenad, lek, trädgård',
                weeklyHardWorkouts: 0, // No weekly requirement
                waterLiters: 2,
                waterDisplay: '2 liter',
                readingPages: 5,
                readingDisplay: '5 sidor',
                dietRules: [
                    'Inget godis/skräpmat (Vardagar)',
                    'Alkohol tillåten',
                ],
                dietDisplay: 'Inget godis (vardagar)',
                photoRequired: false, // Photo is OPTIONAL on Easy
            };

        case 'medium':
            return {
                workouts: 1, // 1 daily activity (can be marked as hard)
                requireOutdoor: false,
                workoutDuration: 30, // 30 min daily activity
                workoutLabel: 'DAGENS AKTIVITET',
                workoutSublabel: '30 min · + 2 tuffa pass/vecka',
                weeklyHardWorkouts: 2, // 2 hard workouts per week
                waterLiters: 3,
                waterDisplay: '3 liter',
                readingPages: 10,
                readingDisplay: '10 sidor',
                dietRules: [
                    'Clean Eating',
                    'Inget processat/socker',
                    'Halva tallriken grönt',
                    'Ingen alkohol (Vardagar)',
                ],
                dietDisplay: 'Clean Eating',
                photoRequired: true,
            };

        case 'hard':
            return {
                workouts: 2,
                requireOutdoor: true,
                workoutDuration: 45, // Each workout must be 45 min
                workoutLabel: 'TRÄNINGSPASS',
                workoutSublabel: '2 × 45 min · 1 utomhus',
                weeklyHardWorkouts: 0, // All workouts are hard
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

// Level order for upgrade/downgrade logic (0 = easiest, 2 = hardest)
const LEVEL_ORDER: Record<DifficultyLevel, number> = {
    easy: 0,
    medium: 1,
    hard: 2,
};

/**
 * Check if changing from current to next level is a downgrade
 * Downgrade = going to an easier level (requires reset)
 */
export function isDowngrade(current: DifficultyLevel, next: DifficultyLevel): boolean {
    return LEVEL_ORDER[next] < LEVEL_ORDER[current];
}

/**
 * Check if changing from current to next level is an upgrade
 * Upgrade = going to a harder level (no reset required)
 */
export function isUpgrade(current: DifficultyLevel, next: DifficultyLevel): boolean {
    return LEVEL_ORDER[next] > LEVEL_ORDER[current];
}
