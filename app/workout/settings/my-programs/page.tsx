/**
 * My Programs Settings Page
 * Manage user's custom workout programs
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';

export default async function MyProgramsSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user's custom programs
    const { data: myPrograms } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_system', false)
        .order('name');

    const programs = myPrograms || [];

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background p-6 pb-24">
                <ServerHeader />

                {/* Back Link */}
                <Link
                    href="/workout/settings"
                    className="inline-flex items-center gap-2 font-inter text-sm text-primary/60 hover:text-primary mb-4"
                >
                    ← Tillbaka
                </Link>

                <div className="mb-6">
                    <h1 className="font-teko text-4xl uppercase tracking-wider text-accent mb-1">
                        MINA PROGRAM
                    </h1>
                    <p className="font-inter text-primary/80 text-sm">
                        Egna träningsprogram du skapat.
                    </p>
                </div>

                {/* Create New Program Button */}
                <div className="mb-8">
                    <button
                        disabled
                        className="w-full py-4 border-2 border-dashed border-primary/30 text-primary/50 font-teko text-xl uppercase tracking-wider opacity-60 cursor-not-allowed"
                    >
                        + SKAPA NYTT PROGRAM (Kommer snart)
                    </button>
                    <p className="mt-2 text-center font-inter text-xs text-primary/40">
                        Möjligheten att skapa egna program kommer i en framtida uppdatering.
                    </p>
                </div>

                {/* My Programs List */}
                <div>
                    <h2 className="font-teko text-xl text-primary/80 uppercase mb-3">
                        Mina program ({programs.length})
                    </h2>

                    {programs.length === 0 ? (
                        <div className="p-6 border border-dashed border-primary/20 text-center">
                            <p className="font-inter text-sm text-primary/60">
                                Du har inga egna program ännu.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {programs.map((program: any) => (
                                <div
                                    key={program.id}
                                    className="bg-surface border border-primary/20 p-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-teko text-xl text-primary">
                                                {program.name}
                                            </h3>
                                            <p className="font-inter text-xs text-primary/60">
                                                {program.days_per_week} dagar/vecka • {program.duration_weeks || '?'} veckor
                                            </p>
                                        </div>
                                    </div>
                                    {program.description && (
                                        <p className="mt-2 font-inter text-sm text-primary/70">
                                            {program.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </MobileContainer>
    );
}
