/**
 * Workout Player Page (Dynamic Route)
 * Main workout session page
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkoutPlayerClient from './WorkoutPlayerClient';

interface WorkoutPageProps {
    params: Promise<{
        trackId: string;
    }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
    const { trackId } = await params;
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch workout track
    const { data: track } = await supabase
        .from('workout_tracks')
        .select('*')
        .eq('id', trackId)
        .single();

    if (!track) {
        redirect('/workout');
    }

    return <WorkoutPlayerClient user={user} track={track as any} />;
}

