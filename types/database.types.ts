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
            // Workout Log Tables
            exercises: {
                Row: Exercise;
                Insert: ExerciseInsert;
                Update: ExerciseUpdate;
            };
            workout_sessions: {
                Row: WorkoutSession;
                Insert: WorkoutSessionInsert;
                Update: WorkoutSessionUpdate;
            };
            workout_exercises: {
                Row: WorkoutExercise;
                Insert: WorkoutExerciseInsert;
                Update: WorkoutExerciseUpdate;
            };
            workout_sets: {
                Row: WorkoutSet;
                Insert: WorkoutSetInsert;
                Update: WorkoutSetUpdate;
            };
            user_exercise_stats: {
                Row: UserExerciseStats;
                Insert: UserExerciseStatsInsert;
                Update: UserExerciseStatsUpdate;
            };
            workout_programs: {
                Row: WorkoutProgram;
                Insert: WorkoutProgramInsert;
                Update: WorkoutProgramUpdate;
            };
            program_days: {
                Row: ProgramDay;
                Insert: ProgramDayInsert;
                Update: ProgramDayUpdate;
            };
            program_exercises: {
                Row: ProgramExercise;
                Insert: ProgramExerciseInsert;
                Update: ProgramExerciseUpdate;
            };
            user_programs: {
                Row: UserProgram;
                Insert: UserProgramInsert;
                Update: UserProgramUpdate;
            };
            user_goals: {
                Row: UserGoal;
                Insert: UserGoalInsert;
                Update: UserGoalUpdate;
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
    difficulty_level: 'easy' | 'medium' | 'hard'; // Difficulty level (GNISTAN/GLÖDEN/PANNBEN)
    total_xp: number; // Total accumulated XP for rank progression
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
    bonus_completed: boolean; // Whether bonus workout was registered today (max 1/day)
    is_hard_workout: boolean; // Whether daily workout was a "Tufft Pass" (Level 2)

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

// ============================================
// WORKOUT LOG TYPES
// ============================================

export type MuscleGroup = 'bröst' | 'rygg' | 'ben' | 'axlar' | 'biceps' | 'triceps' | 'core' | 'cardio';
export type ExerciseEquipment = 'skivstång' | 'hantlar' | 'kabel' | 'maskin' | 'kroppsvikt' | 'kettlebell' | 'inget' | 'cykel' | 'hopprep';
export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'olympic';
export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure' | 'amrap' | 'rest_pause';
export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProgramGoal = 'strength' | 'hypertrophy' | 'powerlifting' | 'general' | 'endurance';
export type SessionStatus = 'active' | 'completed' | 'cancelled';
export type ProgramStatus = 'active' | 'paused' | 'completed' | 'abandoned';
export type GoalType = '1rm' | 'volume_week' | 'workouts_week' | 'workouts_month' | 'body_weight';
export type GoalStatus = 'active' | 'achieved' | 'abandoned';

// ============================================
// EXERCISE TYPES
// ============================================

export interface Exercise {
    id: string;
    name: string;
    name_en: string | null;
    description: string | null;
    instructions: string | null;
    image_url: string | null;
    video_url: string | null;
    muscle_group: MuscleGroup;
    secondary_muscles: string[] | null;
    equipment: ExerciseEquipment;
    category: ExerciseCategory;
    is_system: boolean;
    created_by: string | null;
    is_compound: boolean;
    created_at: string;
    updated_at: string;
}

export interface ExerciseInsert {
    id?: string;
    name: string;
    name_en?: string | null;
    description?: string | null;
    instructions?: string | null;
    image_url?: string | null;
    video_url?: string | null;
    muscle_group: string;
    secondary_muscles?: string[] | null;
    equipment?: string;
    category?: string;
    is_system?: boolean;
    created_by?: string | null;
    is_compound?: boolean;
}

export interface ExerciseUpdate {
    name?: string;
    name_en?: string | null;
    description?: string | null;
    instructions?: string | null;
    image_url?: string | null;
    video_url?: string | null;
    muscle_group?: string;
    secondary_muscles?: string[] | null;
    equipment?: string;
    category?: string;
    is_compound?: boolean;
}

// ============================================
// WORKOUT SESSION TYPES
// ============================================

export interface WorkoutSession {
    id: string;
    user_id: string;
    name: string | null;
    started_at: string;
    completed_at: string | null;
    duration_seconds: number | null;
    status: SessionStatus;
    notes: string | null;
    program_id: string | null;
    program_day_id: string | null;
    total_volume: number;
    total_sets: number;
    total_reps: number;
    created_at: string;
    updated_at: string;
}

export interface WorkoutSessionInsert {
    id?: string;
    user_id: string;
    name?: string | null;
    started_at?: string;
    completed_at?: string | null;
    duration_seconds?: number | null;
    status?: SessionStatus;
    notes?: string | null;
    program_id?: string | null;
    program_day_id?: string | null;
    total_volume?: number;
    total_sets?: number;
    total_reps?: number;
}

export interface WorkoutSessionUpdate {
    name?: string | null;
    completed_at?: string | null;
    duration_seconds?: number | null;
    status?: SessionStatus;
    notes?: string | null;
    total_volume?: number;
    total_sets?: number;
    total_reps?: number;
}

// ============================================
// WORKOUT EXERCISE TYPES
// ============================================

export interface WorkoutExercise {
    id: string;
    session_id: string;
    exercise_id: string;
    order_index: number;
    superset_group: string | null;
    notes: string | null;
    created_at: string;
    // Joined data (optional)
    exercise?: Exercise;
    sets?: WorkoutSet[];
}

export interface WorkoutExerciseInsert {
    id?: string;
    session_id: string;
    exercise_id: string;
    order_index?: number;
    superset_group?: string | null;
    notes?: string | null;
}

export interface WorkoutExerciseUpdate {
    order_index?: number;
    superset_group?: string | null;
    notes?: string | null;
}

// ============================================
// WORKOUT SET TYPES
// ============================================

export interface WorkoutSet {
    id: string;
    workout_exercise_id: string;
    set_number: number;
    weight: number | null;
    reps: number | null;
    duration_seconds: number | null;
    distance_meters: number | null;
    set_type: SetType;
    rpe: number | null;
    rir: number | null;
    is_pr: boolean;
    completed: boolean;
    created_at: string;
}

export interface WorkoutSetInsert {
    id?: string;
    workout_exercise_id: string;
    set_number?: number;
    weight?: number | null;
    reps?: number | null;
    duration_seconds?: number | null;
    distance_meters?: number | null;
    set_type?: SetType;
    rpe?: number | null;
    rir?: number | null;
    is_pr?: boolean;
    completed?: boolean;
}

export interface WorkoutSetUpdate {
    set_number?: number;
    weight?: number | null;
    reps?: number | null;
    duration_seconds?: number | null;
    distance_meters?: number | null;
    set_type?: SetType;
    rpe?: number | null;
    rir?: number | null;
    is_pr?: boolean;
    completed?: boolean;
}

// ============================================
// USER EXERCISE STATS TYPES (Personal Records)
// ============================================

export interface UserExerciseStats {
    id: string;
    user_id: string;
    exercise_id: string;
    pr_1rm: number | null;
    pr_1rm_date: string | null;
    pr_3rm: number | null;
    pr_3rm_date: string | null;
    pr_5rm: number | null;
    pr_5rm_date: string | null;
    pr_8rm: number | null;
    pr_8rm_date: string | null;
    pr_10rm: number | null;
    pr_10rm_date: string | null;
    pr_12rm: number | null;
    pr_12rm_date: string | null;
    pr_volume_session: number | null;
    pr_volume_session_date: string | null;
    total_volume: number;
    total_sets: number;
    total_reps: number;
    last_performed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserExerciseStatsInsert {
    id?: string;
    user_id: string;
    exercise_id: string;
    pr_1rm?: number | null;
    pr_1rm_date?: string | null;
    pr_3rm?: number | null;
    pr_3rm_date?: string | null;
    pr_5rm?: number | null;
    pr_5rm_date?: string | null;
    pr_8rm?: number | null;
    pr_8rm_date?: string | null;
    pr_10rm?: number | null;
    pr_10rm_date?: string | null;
    pr_12rm?: number | null;
    pr_12rm_date?: string | null;
    pr_volume_session?: number | null;
    pr_volume_session_date?: string | null;
    total_volume?: number;
    total_sets?: number;
    total_reps?: number;
    last_performed_at?: string | null;
}

export interface UserExerciseStatsUpdate {
    pr_1rm?: number | null;
    pr_1rm_date?: string | null;
    pr_3rm?: number | null;
    pr_3rm_date?: string | null;
    pr_5rm?: number | null;
    pr_5rm_date?: string | null;
    pr_8rm?: number | null;
    pr_8rm_date?: string | null;
    pr_10rm?: number | null;
    pr_10rm_date?: string | null;
    pr_12rm?: number | null;
    pr_12rm_date?: string | null;
    pr_volume_session?: number | null;
    pr_volume_session_date?: string | null;
    total_volume?: number;
    total_sets?: number;
    total_reps?: number;
    last_performed_at?: string | null;
}

// ============================================
// WORKOUT PROGRAM TYPES
// ============================================

export interface WorkoutProgram {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    difficulty: ProgramDifficulty;
    goal: ProgramGoal;
    days_per_week: number;
    duration_weeks: number | null;
    is_system: boolean;
    is_premium: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    // Joined data (optional)
    days?: ProgramDay[];
}

export interface WorkoutProgramInsert {
    id?: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    difficulty?: ProgramDifficulty;
    goal?: ProgramGoal;
    days_per_week?: number;
    duration_weeks?: number | null;
    is_system?: boolean;
    is_premium?: boolean;
    created_by?: string | null;
}

export interface WorkoutProgramUpdate {
    name?: string;
    description?: string | null;
    image_url?: string | null;
    difficulty?: ProgramDifficulty;
    goal?: ProgramGoal;
    days_per_week?: number;
    duration_weeks?: number | null;
    is_premium?: boolean;
}

// ============================================
// PROGRAM DAY TYPES
// ============================================

export interface ProgramDay {
    id: string;
    program_id: string;
    week_number: number;
    day_number: number;
    name: string | null;
    description: string | null;
    created_at: string;
    // Joined data (optional)
    exercises?: ProgramExercise[];
}

export interface ProgramDayInsert {
    id?: string;
    program_id: string;
    week_number?: number;
    day_number: number;
    name?: string | null;
    description?: string | null;
}

export interface ProgramDayUpdate {
    week_number?: number;
    day_number?: number;
    name?: string | null;
    description?: string | null;
}

// ============================================
// PROGRAM EXERCISE TYPES
// ============================================

export interface ProgramExercise {
    id: string;
    program_day_id: string;
    exercise_id: string;
    order_index: number;
    sets: number;
    reps_min: number;
    reps_max: number;
    rest_seconds: number;
    notes: string | null;
    superset_group: string | null;
    created_at: string;
    // Joined data (optional)
    exercise?: Exercise;
}

export interface ProgramExerciseInsert {
    id?: string;
    program_day_id: string;
    exercise_id: string;
    order_index?: number;
    sets?: number;
    reps_min?: number;
    reps_max?: number;
    rest_seconds?: number;
    notes?: string | null;
    superset_group?: string | null;
}

export interface ProgramExerciseUpdate {
    order_index?: number;
    sets?: number;
    reps_min?: number;
    reps_max?: number;
    rest_seconds?: number;
    notes?: string | null;
    superset_group?: string | null;
}

// ============================================
// USER PROGRAM TYPES (Subscriptions)
// ============================================

export interface UserProgram {
    id: string;
    user_id: string;
    program_id: string;
    started_at: string;
    current_week: number;
    current_day: number;
    completed_days: number;
    status: ProgramStatus;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined data (optional)
    program?: WorkoutProgram;
}

export interface UserProgramInsert {
    id?: string;
    user_id: string;
    program_id: string;
    started_at?: string;
    current_week?: number;
    current_day?: number;
    completed_days?: number;
    status?: ProgramStatus;
    completed_at?: string | null;
}

export interface UserProgramUpdate {
    current_week?: number;
    current_day?: number;
    completed_days?: number;
    status?: ProgramStatus;
    completed_at?: string | null;
}

// ============================================
// USER GOAL TYPES
// ============================================

export interface UserGoal {
    id: string;
    user_id: string;
    goal_type: GoalType;
    exercise_id: string | null;
    target_value: number;
    current_value: number;
    unit: string | null;
    target_date: string | null;
    status: GoalStatus;
    achieved_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined data (optional)
    exercise?: Exercise;
}

export interface UserGoalInsert {
    id?: string;
    user_id: string;
    goal_type: GoalType;
    exercise_id?: string | null;
    target_value: number;
    current_value?: number;
    unit?: string | null;
    target_date?: string | null;
    status?: GoalStatus;
    achieved_at?: string | null;
}

export interface UserGoalUpdate {
    target_value?: number;
    current_value?: number;
    unit?: string | null;
    target_date?: string | null;
    status?: GoalStatus;
    achieved_at?: string | null;
}
