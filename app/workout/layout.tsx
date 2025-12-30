/**
 * Workout Section Layout
 * Includes bottom navigation on all workout pages
 */

import { createClient } from '@/lib/supabase/server';
import WorkoutLayoutClient from '@/components/workout-log/WorkoutLayoutClient';

export default async function WorkoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let activeProgram = null;

    if (user) {
        // Fetch user's active program subscription
        const { data: userPrograms } = await supabase
            .from('user_programs')
            .select(`
                *,
                program:workout_programs(*)
            `)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .limit(1)
            .single();

        activeProgram = userPrograms;
    }

    // TODO: Fetch running progress from user's daily_logs or a dedicated table

    return (
        <WorkoutLayoutClient
            activeProgram={activeProgram as any}
            runningProgress={null}
        >
            {children}
        </WorkoutLayoutClient>
    );
}
