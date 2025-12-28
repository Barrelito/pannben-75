/**
 * Squad Page (Lobby)
 * Server Component
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SquadPageClient from '@/components/squad/SquadPageClient';

export default async function SquadPage() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <SquadPageClient user={user} />;
}
