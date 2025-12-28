/**
 * Squad Detail Page
 * Dynamic route for specific squad
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SquadDetailClient from '@/components/squad/SquadDetailClient';

interface Props {
    params: {
        id: string;
    };
}

export default async function SquadDetailPage({ params }: Props) {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <SquadDetailClient user={user} squadId={resolvedParams.id} />;
}
