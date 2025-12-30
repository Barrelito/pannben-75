'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    Exercise,
    ExerciseInsert,
    WorkoutProgram,
    WorkoutProgramInsert,
    ProgramDay,
    ProgramDayInsert,
    ProgramExercise,
    ProgramExerciseInsert,
} from '@/types/database.types';

// ============================================
// ADMIN CHECK
// ============================================

async function isAdmin(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    return profile?.is_admin ?? false;
}

// ============================================
// EXERCISE ADMIN ACTIONS
// ============================================

/**
 * Create a system exercise (admin only)
 */
export async function createSystemExercise(
    exercise: Omit<ExerciseInsert, 'id' | 'created_by' | 'is_system'>
): Promise<{ data: Exercise | null; error: string | null }> {
    if (!await isAdmin()) {
        return { data: null, error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('exercises')
        .insert({
            ...exercise,
            is_system: true,
            created_by: null,
        })
        .select()
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath('/admin/workout');
    revalidatePath('/workout/exercises');
    return { data, error: null };
}

/**
 * Update an exercise (admin only for system exercises)
 */
export async function updateSystemExercise(
    exerciseId: string,
    updates: Partial<Omit<ExerciseInsert, 'id' | 'created_by' | 'is_system'>>
): Promise<{ error: string | null }> {
    if (!await isAdmin()) {
        return { error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('exercises')
        .update(updates)
        .eq('id', exerciseId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/workout');
    revalidatePath('/workout/exercises');
    return { error: null };
}

/**
 * Delete a system exercise (admin only)
 */
export async function deleteSystemExercise(exerciseId: string): Promise<{ error: string | null }> {
    if (!await isAdmin()) {
        return { error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('is_system', true);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/workout');
    revalidatePath('/workout/exercises');
    return { error: null };
}

// ============================================
// PROGRAM ADMIN ACTIONS
// ============================================

/**
 * Create a system program (admin only)
 */
export async function createSystemProgram(
    program: Omit<WorkoutProgramInsert, 'id' | 'created_by' | 'is_system'>
): Promise<{ data: WorkoutProgram | null; error: string | null }> {
    if (!await isAdmin()) {
        return { data: null, error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('workout_programs')
        .insert({
            ...program,
            is_system: true,
            created_by: null,
        })
        .select()
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath('/admin/workout');
    revalidatePath('/workout/programs');
    return { data, error: null };
}

/**
 * Update a system program (admin only)
 */
export async function updateSystemProgram(
    programId: string,
    updates: Partial<Omit<WorkoutProgramInsert, 'id' | 'created_by' | 'is_system'>>
): Promise<{ error: string | null }> {
    if (!await isAdmin()) {
        return { error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('workout_programs')
        .update(updates)
        .eq('id', programId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/workout');
    revalidatePath('/workout/programs');
    return { error: null };
}

/**
 * Delete a system program (admin only)
 */
export async function deleteSystemProgram(programId: string): Promise<{ error: string | null }> {
    if (!await isAdmin()) {
        return { error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('workout_programs')
        .delete()
        .eq('id', programId)
        .eq('is_system', true);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/workout');
    revalidatePath('/workout/programs');
    return { error: null };
}

// ============================================
// PROGRAM DAY ACTIONS
// ============================================

/**
 * Add a day to a program (admin only)
 */
export async function addProgramDay(
    programId: string,
    day: Omit<ProgramDayInsert, 'id' | 'program_id'>
): Promise<{ data: ProgramDay | null; error: string | null }> {
    if (!await isAdmin()) {
        return { data: null, error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('program_days')
        .insert({
            ...day,
            program_id: programId,
        })
        .select()
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath('/admin/workout');
    return { data, error: null };
}

/**
 * Update a program day (admin only)
 */
export async function updateProgramDay(
    dayId: string,
    updates: Partial<Omit<ProgramDayInsert, 'id' | 'program_id'>>
): Promise<{ error: string | null }> {
    if (!await isAdmin()) {
        return { error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('program_days')
        .update(updates)
        .eq('id', dayId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/workout');
    return { error: null };
}

/**
 * Delete a program day (admin only)
 */
export async function deleteProgramDay(dayId: string): Promise<{ error: string | null }> {
    if (!await isAdmin()) {
        return { error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('program_days')
        .delete()
        .eq('id', dayId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/workout');
    return { error: null };
}

// ============================================
// PROGRAM EXERCISE ACTIONS
// ============================================

/**
 * Add an exercise to a program day (admin only)
 */
export async function addProgramExercise(
    programDayId: string,
    exerciseData: Omit<ProgramExerciseInsert, 'id' | 'program_day_id'>
): Promise<{ data: ProgramExercise | null; error: string | null }> {
    if (!await isAdmin()) {
        return { data: null, error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('program_exercises')
        .insert({
            ...exerciseData,
            program_day_id: programDayId,
        })
        .select()
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    revalidatePath('/admin/workout');
    return { data, error: null };
}

/**
 * Update a program exercise (admin only)
 */
export async function updateProgramExercise(
    programExerciseId: string,
    updates: Partial<Omit<ProgramExerciseInsert, 'id' | 'program_day_id'>>
): Promise<{ error: string | null }> {
    if (!await isAdmin()) {
        return { error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('program_exercises')
        .update(updates)
        .eq('id', programExerciseId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/workout');
    return { error: null };
}

/**
 * Delete a program exercise (admin only)
 */
export async function deleteProgramExercise(programExerciseId: string): Promise<{ error: string | null }> {
    if (!await isAdmin()) {
        return { error: 'Ej behörig' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('program_exercises')
        .delete()
        .eq('id', programExerciseId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/workout');
    return { error: null };
}

// ============================================
// COPY WEEK ACTION
// ============================================

/**
 * Copy a week to another week number (admin only)
 * Copies all days and their exercises from sourceWeek to targetWeek
 */
export async function copyProgramWeek(
    programId: string,
    sourceWeek: number,
    targetWeek: number
): Promise<{ error: string | null }> {
    if (!await isAdmin()) {
        return { error: 'Ej behörig' };
    }

    const supabase = await createClient();

    // Get all days from source week with their exercises
    const { data: sourceDays, error: fetchError } = await supabase
        .from('program_days')
        .select(`
            *,
            exercises:program_exercises(*)
        `)
        .eq('program_id', programId)
        .eq('week_number', sourceWeek)
        .order('day_number');

    if (fetchError) {
        return { error: fetchError.message };
    }

    if (!sourceDays || sourceDays.length === 0) {
        return { error: 'Inga dagar att kopiera från vecka ' + sourceWeek };
    }

    // Delete existing days in target week first
    const { error: deleteError } = await supabase
        .from('program_days')
        .delete()
        .eq('program_id', programId)
        .eq('week_number', targetWeek);

    if (deleteError) {
        return { error: deleteError.message };
    }

    // Copy each day and its exercises
    for (const day of sourceDays) {
        // Insert new day for target week
        const { data: newDay, error: dayError } = await supabase
            .from('program_days')
            .insert({
                program_id: programId,
                week_number: targetWeek,
                day_number: day.day_number,
                name: day.name,
                description: day.description,
            })
            .select()
            .single();

        if (dayError || !newDay) {
            return { error: dayError?.message || 'Kunde inte skapa dag' };
        }

        // Copy exercises to the new day
        const exercises = (day as any).exercises || [];
        for (const ex of exercises) {
            const { error: exError } = await supabase
                .from('program_exercises')
                .insert({
                    program_day_id: newDay.id,
                    exercise_id: ex.exercise_id,
                    order_index: ex.order_index,
                    sets: ex.sets,
                    reps_min: ex.reps_min,
                    reps_max: ex.reps_max,
                    rest_seconds: ex.rest_seconds,
                    notes: ex.notes,
                    superset_group: ex.superset_group,
                });

            if (exError) {
                return { error: exError.message };
            }
        }
    }

    revalidatePath('/admin/workout');
    return { error: null };
}
