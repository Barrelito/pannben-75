'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    Exercise,
    WorkoutSession,
    WorkoutExercise,
    WorkoutSet,
    WorkoutSetInsert,
    WorkoutExerciseInsert,
    ExerciseInsert,
} from '@/types/database.types';

// ============================================
// EXERCISE ACTIONS
// ============================================

/**
 * Get all exercises (system + user's custom)
 */
export async function getExercises(filters?: {
    muscleGroup?: string;
    equipment?: string;
    search?: string;
}): Promise<{ data: Exercise[] | null; error: string | null }> {
    const supabase = await createClient();

    let query = supabase
        .from('exercises')
        .select('*')
        .order('name');

    if (filters?.muscleGroup) {
        query = query.eq('muscle_group', filters.muscleGroup);
    }

    if (filters?.equipment) {
        query = query.eq('equipment', filters.equipment);
    }

    if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

/**
 * Get a single exercise by ID
 */
export async function getExercise(exerciseId: string): Promise<{ data: Exercise | null; error: string | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

/**
 * Create a new custom exercise
 */
export async function createExercise(exercise: Omit<ExerciseInsert, 'id' | 'created_by' | 'is_system'>): Promise<{ data: Exercise | null; error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: 'Ej inloggad' };
    }

    const { data, error } = await supabase
        .from('exercises')
        .insert({
            ...exercise,
            created_by: user.id,
            is_system: false,
        })
        .select()
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath('/workout/exercises');
    return { data, error: null };
}

/**
 * Delete a custom exercise
 */
export async function deleteExercise(exerciseId: string): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Ej inloggad' };
    }

    const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('created_by', user.id); // Security check handled by RLS, but good for explicit safety

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/workout/exercises');
    return { error: null };
}

// ============================================
// WORKOUT SESSION ACTIONS
// ============================================

/**
 * Start a new workout session
 */
export async function startWorkout(
    name?: string,
    programId?: string,
    programDayId?: string
): Promise<{ data: WorkoutSession | null; error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: 'Ej inloggad' };
    }

    // Check if user has premium
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

    if (!profile?.is_premium) {
        return { data: null, error: 'Träningsloggen kräver Premium' };
    }

    // Check for existing active session
    const { data: existingSession } = await supabase
        .from('workout_sessions')
        .select('*, workout_exercises(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    let session = existingSession;

    // If no session exists, create one
    if (!session) {
        const { data: newSession, error } = await supabase
            .from('workout_sessions')
            .insert({
                user_id: user.id,
                name: name || null,
                program_id: programId || null,
                program_day_id: programDayId || null,
                status: 'active',
            })
            .select('*, workout_exercises(*)')
            .single();

        if (error || !newSession) {
            return { data: null, error: error?.message || 'Kunde inte skapa pass' };
        }
        session = newSession;
    } else {
        // If session exists, update its program info if provided and missing
        if (programId || programDayId) {
            await supabase
                .from('workout_sessions')
                .update({
                    program_id: programId || session.program_id,
                    program_day_id: programDayId || session.program_day_id,
                    name: name || session.name // Update name to match program day if generic
                })
                .eq('id', session.id);
        }
    }

    // If starting a program day, and session has no exercises, populate them
    if (programDayId && (!session.workout_exercises || session.workout_exercises.length === 0)) {
        // Fetch program exercises
        const { data: programExercises } = await supabase
            .from('program_exercises')
            .select('*')
            .eq('program_day_id', programDayId)
            .order('order_index');

        if (programExercises && programExercises.length > 0) {
            for (const pExercise of programExercises) {
                // Add exercise to workout
                const { data: wExercise } = await supabase
                    .from('workout_exercises')
                    .insert({
                        session_id: session.id,
                        exercise_id: pExercise.exercise_id,
                        order_index: pExercise.order_index,
                        notes: pExercise.notes,
                        superset_group: pExercise.superset_group
                    })
                    .select()
                    .single();

                if (wExercise) {
                    // Add planned sets (uncompleted)
                    const setsToInsert: WorkoutSetInsert[] = [];
                    for (let i = 1; i <= pExercise.sets; i++) {
                        setsToInsert.push({
                            workout_exercise_id: wExercise.id,
                            set_number: i,
                            reps: pExercise.reps_min, // Use min reps as initial target
                            weight: null, // User fills this
                            set_type: 'normal',
                            completed: false
                        });
                    }

                    if (setsToInsert.length > 0) {
                        await supabase.from('workout_sets').insert(setsToInsert);
                    }
                }
            }
        }
    }

    revalidatePath('/workout');
    return { data: session, error: null };
}

/**
 * Get the current active workout session with exercises and sets
 */
export async function getActiveWorkout(): Promise<{
    data: (WorkoutSession & { exercises: (WorkoutExercise & { exercise: Exercise; sets: WorkoutSet[] })[] }) | null;
    error: string | null
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: 'Ej inloggad' };
    }

    const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    if (sessionError || !session) {
        return { data: null, error: null }; // No active session is not an error
    }

    // Get exercises with their details and sets
    const { data: exercises, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
            *,
            exercise:exercises(*),
            sets:workout_sets(*)
        `)
        .eq('session_id', session.id)
        .order('order_index');

    if (exercisesError) {
        return { data: null, error: exercisesError.message };
    }

    return {
        data: {
            ...session,
            exercises: exercises || []
        },
        error: null
    };
}

/**
 * Get workout history
 */
export async function getWorkoutHistory(limit = 10): Promise<{ data: WorkoutSession[] | null; error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: 'Ej inloggad' };
    }

    const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

/**
 * Add an exercise to the current workout
 */
export async function addExerciseToWorkout(
    sessionId: string,
    exerciseId: string
): Promise<{ data: WorkoutExercise | null; error: string | null }> {
    const supabase = await createClient();

    // Get the current max order_index
    const { data: existing } = await supabase
        .from('workout_exercises')
        .select('order_index')
        .eq('session_id', sessionId)
        .order('order_index', { ascending: false })
        .limit(1);

    const nextIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

    const insertData: WorkoutExerciseInsert = {
        session_id: sessionId,
        exercise_id: exerciseId,
        order_index: nextIndex,
    };

    const { data, error } = await supabase
        .from('workout_exercises')
        .insert(insertData)
        .select(`
            *,
            exercise:exercises(*)
        `)
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath('/workout/log');
    return { data, error: null };
}

/**
 * Remove an exercise from the workout
 */
export async function removeExerciseFromWorkout(workoutExerciseId: string): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', workoutExerciseId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/workout/log');
    return { error: null };
}

// ============================================
// SET ACTIONS
// ============================================

/**
 * Add a set to an exercise
 */
export async function addSet(
    workoutExerciseId: string,
    setData: {
        weight?: number;
        reps?: number;
        setType?: 'normal' | 'warmup' | 'dropset' | 'failure' | 'amrap' | 'rest_pause';
        completed?: boolean;
    }
): Promise<{ data: WorkoutSet | null; error: string | null }> {
    const supabase = await createClient();

    // Get the current max set_number
    const { data: existing } = await supabase
        .from('workout_sets')
        .select('set_number')
        .eq('workout_exercise_id', workoutExerciseId)
        .order('set_number', { ascending: false })
        .limit(1);

    const nextSetNumber = existing && existing.length > 0 ? existing[0].set_number + 1 : 1;

    const insertData: WorkoutSetInsert = {
        workout_exercise_id: workoutExerciseId,
        set_number: nextSetNumber,
        weight: setData.weight ?? null,
        reps: setData.reps ?? null,
        set_type: setData.setType ?? 'normal',
        completed: setData.completed ?? true,
    };

    const { data, error } = await supabase
        .from('workout_sets')
        .insert(insertData)
        .select()
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath('/workout/log');
    return { data, error: null };
}

/**
 * Update a set
 */
export async function updateSet(
    setId: string,
    updates: {
        weight?: number | null;
        reps?: number | null;
        setType?: 'normal' | 'warmup' | 'dropset' | 'failure' | 'amrap' | 'rest_pause';
        completed?: boolean;
    }
): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('workout_sets')
        .update({
            weight: updates.weight,
            reps: updates.reps,
            set_type: updates.setType,
            completed: updates.completed,
        })
        .eq('id', setId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/workout/log');
    return { error: null };
}

/**
 * Delete a set
 */
export async function deleteSet(setId: string): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('id', setId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/workout/log');
    return { error: null };
}

// ============================================
// COMPLETE WORKOUT
// ============================================

/**
 * Complete a workout session and calculate stats
 */
export async function completeWorkout(sessionId: string): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Ej inloggad' };
    }

    // Get all sets for this session to calculate stats
    const { data: exercises } = await supabase
        .from('workout_exercises')
        .select(`
            id,
            sets:workout_sets(weight, reps, completed)
        `)
        .eq('session_id', sessionId);

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    if (exercises) {
        for (const exercise of exercises) {
            const sets = exercise.sets as { weight: number | null; reps: number | null; completed: boolean }[];
            for (const set of sets) {
                if (set.completed) {
                    totalSets++;
                    totalReps += set.reps || 0;
                    totalVolume += (set.weight || 0) * (set.reps || 0);
                }
            }
        }
    }

    // Get session start time for duration calculation
    const { data: session } = await supabase
        .from('workout_sessions')
        .select('started_at, program_id')
        .eq('id', sessionId)
        .single();

    const durationSeconds = session
        ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
        : 0;

    // Update session as completed
    const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            duration_seconds: durationSeconds,
            total_volume: totalVolume,
            total_sets: totalSets,
            total_reps: totalReps,
        })
        .eq('id', sessionId);

    if (updateError) {
        return { error: updateError.message };
    }

    // Mark workout_indoor_completed in daily_logs
    const today = new Date().toISOString().split('T')[0];

    // Try to update existing log or insert new one
    const { data: existingLog } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('log_date', today)
        .single();

    if (existingLog) {
        await supabase
            .from('daily_logs')
            .update({ workout_indoor_completed: true })
            .eq('id', existingLog.id);
    } else {
        await supabase
            .from('daily_logs')
            .insert({
                user_id: user.id,
                log_date: today,
                workout_indoor_completed: true,
            });
    }

    // Update program progress if part of a program
    if (session?.program_id) {
        const { data: userProgram } = await supabase
            .from('user_programs')
            .select('id')
            .eq('user_id', user.id)
            .eq('program_id', session.program_id)
            .eq('status', 'active')
            .single();

        if (userProgram) {
            await updateProgramProgress(userProgram.id);
        }
    }

    revalidatePath('/workout');
    revalidatePath('/dashboard');
    return { error: null };
}

/**
 * Log a quick workout (Outdoor/Indoor)
 */
export async function logQuickWorkout(
    name: string,
    type: 'indoor' | 'outdoor'
): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Ej inloggad' };
    }

    // 1. Create a completed workout session
    const { error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
            user_id: user.id,
            name: name,
            status: 'completed',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            duration_seconds: 0, // Unknown duration for quick logs
            total_volume: 0,
            total_sets: 0,
            total_reps: 0,
        });

    if (sessionError) {
        return { error: sessionError.message };
    }

    // 2. Update daily log
    const today = new Date().toISOString().split('T')[0];
    const updateField = type === 'indoor' ? 'workout_indoor_completed' : 'workout_outdoor_completed';

    // Try to update existing log or insert new one
    const { data: existingLog } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('log_date', today)
        .single();

    if (existingLog) {
        await supabase
            .from('daily_logs')
            .update({ [updateField]: true })
            .eq('id', existingLog.id);
    } else {
        await supabase
            .from('daily_logs')
            .insert({
                user_id: user.id,
                log_date: today,
                [updateField]: true,
            });
    }

    revalidatePath('/workout');
    revalidatePath('/dashboard');
    return { error: null };
}

/**
 * Cancel/discard a workout session
 */
export async function cancelWorkout(sessionId: string): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('workout_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/workout');
    revalidatePath('/dashboard'); // Also refresh dashboard as active session state might change
    return { error: null };
}

/**
 * Get the user's last workout for an exercise (for auto-fill)
 */
export async function getLastWorkoutForExercise(exerciseId: string): Promise<{
    data: { weight: number | null; reps: number | null }[] | null;
    error: string | null;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: 'Ej inloggad' };
    }

    // Find the most recent completed workout that included this exercise
    const { data: recentWorkout } = await supabase
        .from('workout_sessions')
        .select(`
            id,
            workout_exercises!inner(
                id,
                exercise_id,
                sets:workout_sets(weight, reps, set_type, set_number)
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .eq('workout_exercises.exercise_id', exerciseId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

    if (!recentWorkout) {
        return { data: null, error: null };
    }

    // Extract the sets from the workout exercises
    const workoutExercises = recentWorkout.workout_exercises as {
        sets: { weight: number | null; reps: number | null; set_type: string; set_number: number }[];
    }[];

    if (workoutExercises.length === 0) {
        return { data: null, error: null };
    }

    // Get the sets, filter out warmups, and sort by set_number
    const sets = workoutExercises[0].sets
        .filter(s => s.set_type !== 'warmup')
        .sort((a, b) => a.set_number - b.set_number)
        .map(s => ({ weight: s.weight, reps: s.reps }));

    return { data: sets, error: null };
}

// ============================================
// PROGRAM ACTIONS
// ============================================

import type {
    WorkoutProgram,
    ProgramDay,
    ProgramExercise,
    UserProgram,
} from '@/types/database.types';

/**
 * Get all available workout programs
 */
export async function getPrograms(filters?: {
    difficulty?: string;
    goal?: string;
}): Promise<{ data: WorkoutProgram[] | null; error: string | null }> {
    const supabase = await createClient();

    let query = supabase
        .from('workout_programs')
        .select('*')
        .order('name');

    if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.goal) {
        query = query.eq('goal', filters.goal);
    }

    const { data, error } = await query;

    if (error) {
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

/**
 * Get a single program with its days and exercises
 */
export async function getProgram(programId: string): Promise<{
    data: (WorkoutProgram & { days: (ProgramDay & { exercises: (ProgramExercise & { exercise: Exercise })[] })[] }) | null;
    error: string | null;
}> {
    const supabase = await createClient();

    const { data: program, error: programError } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('id', programId)
        .single();

    if (programError || !program) {
        return { data: null, error: programError?.message || 'Program hittades inte' };
    }

    // Get program days with exercises
    const { data: days, error: daysError } = await supabase
        .from('program_days')
        .select(`
            *,
            exercises:program_exercises(
                *,
                exercise:exercises(*)
            )
        `)
        .eq('program_id', programId)
        .order('day_number');

    if (daysError) {
        return { data: null, error: daysError.message };
    }

    return {
        data: {
            ...program,
            days: days || [],
        },
        error: null,
    };
}

/**
 * Get user's subscribed programs
 */
export async function getUserPrograms(): Promise<{
    data: (UserProgram & { program: WorkoutProgram })[] | null;
    error: string | null;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: 'Ej inloggad' };
    }

    const { data, error } = await supabase
        .from('user_programs')
        .select(`
            *,
            program:workout_programs(*)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

    if (error) {
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

/**
 * Subscribe to a workout program
 */
export async function subscribeToProgram(programId: string): Promise<{
    data: UserProgram | null;
    error: string | null;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: 'Ej inloggad' };
    }

    // Check if already subscribed
    const { data: existing } = await supabase
        .from('user_programs')
        .select('id')
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .single();

    if (existing) {
        return { data: null, error: 'Du följer redan detta program' };
    }

    const { data, error } = await supabase
        .from('user_programs')
        .insert({
            user_id: user.id,
            program_id: programId,
            status: 'active',
        })
        .select()
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath('/workout/programs');
    return { data, error: null };
}

/**
 * Unsubscribe from a workout program
 */
export async function unsubscribeFromProgram(userProgramId: string): Promise<{ error: string | null }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('user_programs')
        .delete()
        .eq('id', userProgramId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/workout/programs');
    return { error: null };
}

/**
 * Update program progress after completing a workout
 */
export async function updateProgramProgress(userProgramId: string): Promise<{ error: string | null }> {
    const supabase = await createClient();

    // Get current progress
    const { data: userProgram } = await supabase
        .from('user_programs')
        .select('*, program:workout_programs(*)')
        .eq('id', userProgramId)
        .single();

    if (!userProgram) {
        return { error: 'Program hittades inte' };
    }

    const program = userProgram.program as WorkoutProgram;
    const nextDay = userProgram.current_day + 1;
    const completedDays = userProgram.completed_days + 1;

    let updates: {
        current_day: number;
        current_week: number;
        completed_days: number;
        status?: 'active' | 'paused' | 'completed' | 'abandoned';
        completed_at?: string;
    };

    // Check if we've completed all days in the program
    if (program.duration_weeks && completedDays >= program.days_per_week * program.duration_weeks) {
        updates = {
            current_day: nextDay,
            current_week: userProgram.current_week,
            completed_days: completedDays,
            status: 'completed',
            completed_at: new Date().toISOString(),
        };
    } else if (nextDay > program.days_per_week) {
        // Move to next week
        updates = {
            current_day: 1,
            current_week: userProgram.current_week + 1,
            completed_days: completedDays,
        };
    } else {
        updates = {
            current_day: nextDay,
            current_week: userProgram.current_week,
            completed_days: completedDays,
        };
    }

    const { error } = await supabase
        .from('user_programs')
        .update(updates)
        .eq('id', userProgramId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/workout/programs');
    return { error: null };
}
