// TypeScript types for Pannben 75 logic layer
// Separates UI-facing types from database types

// UI Scale: 0-2 for simplicity
export type ScoreUI = 0 | 1 | 2;

// Morning check-in scores (UI scale)
export interface MorningScoresUI {
    sleep: ScoreUI;
    body: ScoreUI;
    energy: ScoreUI;
    stress: ScoreUI;
    motivation: ScoreUI;
}

// Recovery status enum
export type RecoveryStatus = 'GREEN' | 'YELLOW' | 'RED';

// Recovery calculation result
export interface RecoveryResult {
    status: RecoveryStatus;
    message: string;
    totalScore: number;
}

// Planning data for "Night Watch"
export interface PlanningData {
    plan_workout_1?: string | null;
    plan_workout_1_time?: string | null;
    plan_workout_2?: string | null;
    plan_workout_2_time?: string | null;
    plan_diet?: string | null;
}

// Rule names for the 5 Rules
export type RuleName =
    | 'diet_completed'
    | 'workout_outdoor_completed'
    | 'workout_indoor_completed'
    | 'reading_completed'
    | 'photo_uploaded';

// Grace period check result
export interface GracePeriodResult {
    canLogToday: boolean;
    mustLogYesterday: boolean;
    currentDay: number;
    message?: string;
    // Streak validation fields
    streakBroken: boolean;        // True if >1 day missed
    daysMissed: number;           // How many days since last log
    lastLogDate?: string;         // Date of last log (YYYY-MM-DD)
}
