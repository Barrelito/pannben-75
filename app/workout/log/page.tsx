/**
 * Workout Log Page
 * Main entry point for logging workouts
 * Supports program-based workouts via ?program=xxx query param
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import WorkoutLogClient from '@/components/workout-log/WorkoutLogClient';
import { getActiveWorkout, getWorkoutHistory } from '@/lib/actions/workout';

interface PageProps {
    searchParams: Promise<{ program?: string }>;
}

export default async function WorkoutLogPage({ searchParams }: PageProps) {
    const { program: programId } = await searchParams;
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check premium status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

    const isPremium = profile?.is_premium ?? false;

    // Get active workout if any
    const { data: activeWorkout } = await getActiveWorkout();

    // Get recent workout history
    const { data: history } = await getWorkoutHistory(5);

    // If program ID provided, fetch program day info
    let programDay = null;
    let userProgram = null;

    if (programId) {
        // Get user's subscription to this program
        const { data: userProgramData } = await supabase
            .from('user_programs')
            .select(`
                *,
                program:workout_programs(*)
            `)
            .eq('user_id', user.id)
            .eq('program_id', programId)
            .single();

        if (userProgramData) {
            userProgram = userProgramData;

            // Get the program day for current week/day
            const { data: dayData } = await supabase
                .from('program_days')
                .select(`
                    *,
                    exercises:program_exercises(
                        *,
                        exercise:exercises(*)
                    )
                `)
                .eq('program_id', programId)
                .eq('week_number', userProgramData.current_week || 1)
                .eq('day_number', userProgramData.current_day || 1)
                .single();

            if (dayData) {
                programDay = dayData;
            }
        }
    }

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background">
                <div className="p-6 pb-4">
                    <ServerHeader />
                </div>

                {/* Debug Info: Missing Day */}
                {(programId && !programDay) && (
                    <div className="mx-6 p-4 bg-red-500/10 border border-red-500 rounded text-xs font-mono text-red-500 overflow-auto max-h-40 mb-4">
                        <p className="font-bold">DEBUG INFO (Missing Day):</p>
                        <p>Program ID: {programId}</p>
                        <p>User Sub: {userProgram ? `Week ${userProgram.current_week}, Day ${userProgram.current_day}` : 'Not found'}</p>
                        <p>Program Day: Not found for this week/day.</p>
                    </div>
                )}

                {/* Debug Info: Empty Day */}
                {(programDay && (!programDay.exercises || programDay.exercises.length === 0)) && (
                    <div className="mx-6 p-4 bg-yellow-500/10 border border-yellow-500 rounded text-xs font-mono text-yellow-600 overflow-auto max-h-40 mb-4">
                        <p className="font-bold">DEBUG INFO (Empty Day):</p>
                        <p>Program Day: {programDay.name} ok</p>
                        <p>Exercises: 0 found.</p>
                        <p>Add exercises to this day in the Program Editor.</p>
                    </div>
                )}

                <WorkoutLogClient
                    isPremium={isPremium}
                    activeWorkout={activeWorkout}
                    recentWorkouts={history || []}
                    programDay={programDay as any}
                    userProgram={userProgram as any}
                />
            </main>
        </MobileContainer>
    );
}
