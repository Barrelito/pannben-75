/**
 * Dashboard Page - The Command Center
 * Main interface where users spend 99% of their time
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Check if user needs to complete onboarding
    if (!profile?.display_name) {
        redirect('/onboarding');
    }

    return <DashboardClient user={user} profile={profile} />;
}
