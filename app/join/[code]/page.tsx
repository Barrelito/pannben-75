/**
 * Join Squad Landing Page
 * Server Component
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import JoinSquadClient from '@/components/squad/JoinSquadClient';

interface PageProps {
    params: {
        code: string;
    };
}

// Generate Metadata for social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { code } = params;

    // We can't easily fetch squad name here efficiently without extra request,
    // but generic metadata is fine for now or we do the fetch.
    return {
        title: 'Gå med i min pluton | Pannben 75',
        description: 'En inbjudan till att träna, lida och växa tillsammans.',
    };
}

export default async function JoinPage({ params }: PageProps) {
    const { code } = params;
    const supabase = await createClient();

    // Fetch squad by invite code (public read should be allowed on squads table for this)
    // If RLS blocks this, we might need a workaround or ensure RLS allows reading basic squad info by invite_code
    const { data: squad, error } = await supabase
        .from('squads')
        .select('name')
        .eq('invite_code', code.toUpperCase())
        .single();

    if (error || !squad) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
                <h1 className="font-teko text-3xl mb-4">OGILTIG KOD</h1>
                <p className="font-inter text-primary/60">Koden {code} verkar inte stämma.</p>
            </div>
        );
    }

    return <JoinSquadClient squadName={squad.name} inviteCode={code} />;
}
