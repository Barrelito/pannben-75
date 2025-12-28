/**
 * Session Page - Server Component
 * Loads session and renders player
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/data/runningProgram';
import SessionPlayer from '@/components/run/SessionPlayer';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function SessionPage(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient();

    // Auth check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get session data
    const session = getSession(id);

    if (!session) {
        redirect('/run');
    }

    return <SessionPlayer session={session} userId={user.id} />;
}
