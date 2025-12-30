/**
 * Workout Log Page
 * Main entry point for logging workouts
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import WorkoutLogClient from '@/components/workout-log/WorkoutLogClient';
import { getActiveWorkout, getWorkoutHistory } from '@/lib/actions/workout';

export default async function WorkoutLogPage() {
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

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background">
                <div className="p-6 pb-4">
                    <ServerHeader />
                </div>

                <WorkoutLogClient
                    isPremium={isPremium}
                    activeWorkout={activeWorkout}
                    recentWorkouts={history || []}
                />
            </main>
        </MobileContainer>
    );
}
