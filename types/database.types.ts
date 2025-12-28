// TypeScript types matching the Pannben 75 database schema
// Generated from supabase/schema.sql

export type RecoveryStatus = 'GREEN' | 'YELLOW' | 'RED';
export type SquadRole = 'admin' | 'member';

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: ProfileInsert;
                Update: ProfileUpdate;
            };
            diet_tracks: {
                Row: DietTrack;
                Insert: DietTrackInsert;
                Update: DietTrackUpdate;
            };
            workout_tracks: {
                Row: WorkoutTrack;
                Insert: WorkoutTrackInsert;
                Update: WorkoutTrackUpdate;
            };
            daily_logs: {
                Row: DailyLog;
                Insert: DailyLogInsert;
                Update: DailyLogUpdate;
            };
            squads: {
                Row: Squad;
                Insert: SquadInsert;
                Update: SquadUpdate;
            };
            squad_members: {
                Row: SquadMember;
                Insert: SquadMemberInsert;
                Update: SquadMemberUpdate;
            };
        };
    };
}

// ============================================
// PROFILE TYPES
// ============================================

export interface Profile {
    id: string; // UUID from auth.users
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    start_date: string | null; // ISO date string
    current_day: number;
    recovery_status: RecoveryStatus;
    is_premium: boolean;
    selected_diet_id: string | null; // UUID reference to diet_tracks
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

export interface ProfileInsert {
    id: string;
    username?: string | null;
    avatar_url?: string | null;
    start_date?: string | null;
    current_day?: number;
    recovery_status?: RecoveryStatus;
}

export interface ProfileUpdate {
    username?: string | null;
    avatar_url?: string | null;
    start_date?: string | null;
    current_day?: number;
    recovery_status?: RecoveryStatus;
    updated_at?: string;
}

// ============================================
// DIET TRACK TYPES
// ============================================

export interface DietRules {
    [key: string]: unknown; // JSONB - flexible structure
    carbs_max_grams?: number;
    focus?: string[];
    avoid?: string[];
    allowed?: string[];
    philosophy?: string;
    moderate?: string[];
    strategy?: string[];
    tips?: string[];
}

export interface DietTrack {
    id: string; // UUID
    name: string;
    description: string;
    rules: DietRules;
    created_at: string; // ISO timestamp
}

export interface DietTrackInsert {
    id?: string;
    name: string;
    description: string;
    rules: DietRules;
}

export interface DietTrackUpdate {
    name?: string;
    description?: string;
    rules?: DietRules;
}

// ============================================
// WORKOUT TRACK TYPES
// ============================================

export interface WorkoutStructure {
    [key: string]: unknown; // JSONB - flexible structure for workout details
    exercises?: Array<{
        name: string;
        sets?: number;
        reps?: number;
        duration?: string;
    }>;
    duration?: string;
    difficulty?: string;
    equipment?: string[];
}

export interface WorkoutTrack {
    id: string; // UUID
    title: string;
    structure: WorkoutStructure;
    created_at: string; // ISO timestamp
}

export interface WorkoutTrackInsert {
    id?: string;
    title: string;
    structure: WorkoutStructure;
}

export interface WorkoutTrackUpdate {
    title?: string;
    structure?: WorkoutStructure;
}

// ============================================
// DAILY LOG TYPES
// ============================================

export interface DailyLog {
    id: string; // UUID
    user_id: string; // UUID
    log_date: string; // ISO date string

    // Morning Check-in Scores (1-10)
    sleep_score: number | null;
    body_score: number | null;
    energy_score: number | null;
    stress_score: number | null;
    motivation_score: number | null;

    // The 5 Rules
    diet_completed: boolean;
    water_intake: number; // Liters
    workout_outdoor_completed: boolean;
    workout_indoor_completed: boolean;
    reading_completed: boolean;
    photo_uploaded: boolean;
    progress_photo_url: string | null;

    // The Night Watch (Planning)
    plan_workout_1: string | null;
    plan_workout_1_time: string | null; // HH:MM format
    plan_workout_2: string | null;
    plan_workout_2_time: string | null; // HH:MM format
    plan_diet: string | null;

    // Status
    is_completed: boolean;

    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

export interface DailyLogInsert {
    id?: string;
    user_id: string;
    log_date: string;

    // Morning Check-in
    sleep_score?: number | null;
    body_score?: number | null;
    energy_score?: number | null;
    stress_score?: number | null;
    motivation_score?: number | null;

    // The 5 Rules
    diet_completed?: boolean;
    water_intake?: number;
    workout_outdoor_completed?: boolean;
    workout_indoor_completed?: boolean;
    reading_completed?: boolean;
    photo_uploaded?: boolean;

    // Planning
    plan_workout_1?: string | null;
    plan_workout_1_time?: string | null;
    plan_workout_2?: string | null;
    plan_workout_2_time?: string | null;
    plan_diet?: string | null;

    // Status
    is_completed?: boolean;
}

export interface DailyLogUpdate {
    log_date?: string;

    // Morning Check-in
    sleep_score?: number | null;
    body_score?: number | null;
    energy_score?: number | null;
    stress_score?: number | null;
    motivation_score?: number | null;

    // The 5 Rules
    diet_completed?: boolean;
    water_intake?: number;
    workout_outdoor_completed?: boolean;
    workout_indoor_completed?: boolean;
    reading_completed?: boolean;
    photo_uploaded?: boolean;

    // Planning
    plan_workout_1?: string | null;
    plan_workout_1_time?: string | null;
    plan_workout_2?: string | null;
    plan_workout_2_time?: string | null;
    plan_diet?: string | null;

    // Status
    is_completed?: boolean;

    updated_at?: string;
}

// ============================================
// SQUAD TYPES
// ============================================

export interface Squad {
    id: string; // UUID
    name: string;
    description: string | null;
    invite_code: string | null; // 6-char invite code (XXXX-XX)
    created_by: string; // UUID
    created_at: string; // ISO timestamp
}

export interface SquadInsert {
    id?: string;
    name: string;
    description?: string | null;
    invite_code?: string | null;
    created_by: string;
}

export interface SquadUpdate {
    name?: string;
    description?: string | null;
    invite_code?: string | null;
}

export interface SquadMember {
    id: string; // UUID
    squad_id: string; // UUID
    user_id: string; // UUID
    role: SquadRole;
    joined_at: string; // ISO timestamp
}

export interface SquadMemberInsert {
    id?: string;
    squad_id: string;
    user_id: string;
    role?: SquadRole;
}

export interface SquadMemberUpdate {
    role?: SquadRole;
}
