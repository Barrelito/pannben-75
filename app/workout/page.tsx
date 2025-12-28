/**
 * Workout Selection Page
 * Displays available workout tracks
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';

export default async function WorkoutSelectionPage() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch available workout tracks
    const { data: tracks } = await supabase
        .from('workout_tracks')
        .select('*')
        .order('title');

    const workoutTracks = tracks || [];

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background p-6">
                {/* Header */}
                <div className="mb-8">
                    <Logo />
                    <h1 className="font-teko text-3xl uppercase tracking-wider text-accent mt-4">
                        VÄLJ TRÄNING
                    </h1>
                </div>

                {/* Workout Cards */}
                <div className="space-y-4">
                    {workoutTracks.map((track) => {
                        const structure = track.structure as any;
                        const icon = getTrackIcon(structure?.type);
                        const description = structure?.description || 'Träningspass';

                        return (
                            <Link
                                key={track.id}
                                href={`/workout/${track.id}`}
                                className="block bg-surface border-2 border-primary/20 p-6 hover:border-accent transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-3xl">{icon}</span>
                                            <h2 className="font-teko text-2xl uppercase tracking-wider text-primary">
                                                {track.title}
                                            </h2>
                                        </div>
                                        <p className="font-inter text-sm text-primary/80">
                                            {description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 px-6 py-3 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider text-center border-2 border-accent hover:bg-transparent hover:text-accent transition-all">
                                    STARTA
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Back to Dashboard */}
                <Link
                    href="/dashboard"
                    className="block mt-8 text-center font-inter text-sm uppercase tracking-wider text-primary/60 hover:text-accent transition-colors"
                >
                    ← Tillbaka till Dashboard
                </Link>
            </main>
        </MobileContainer>
    );
}

function getTrackIcon(type?: string): string {
    const icons: Record<string, string> = {
        Cardio: '🏃',
        Strength: '🏋️',
        Hybrid: '💪',
    };
    return icons[type || ''] || '💪';
}
