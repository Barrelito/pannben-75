/**
 * Workout Admin Dashboard
 * Manage exercises and programs
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import { getExercises, getPrograms } from '@/lib/actions/workout';

export default async function WorkoutAdminPage() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check admin status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        redirect('/dashboard');
    }

    // Fetch data
    const { data: exercises } = await getExercises();
    const { data: programs } = await getPrograms();

    const systemExercises = exercises?.filter(e => e.is_system) || [];
    const systemPrograms = programs?.filter(p => p.is_system) || [];

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background">
                <div className="p-6 pb-20">
                    <ServerHeader />

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-teko text-4xl uppercase tracking-wider text-accent mb-2">
                            WORKOUT ADMIN
                        </h1>
                        <p className="font-inter text-primary/80">
                            Hantera övningar och program
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-surface border border-primary/20 p-4 text-center">
                            <p className="font-teko text-3xl text-accent">{systemExercises.length}</p>
                            <p className="font-inter text-xs text-primary/60 uppercase">Övningar</p>
                        </div>
                        <div className="bg-surface border border-primary/20 p-4 text-center">
                            <p className="font-teko text-3xl text-accent">{systemPrograms.length}</p>
                            <p className="font-inter text-xs text-primary/60 uppercase">Program</p>
                        </div>
                    </div>

                    {/* Navigation Cards */}
                    <div className="space-y-4">
                        {/* Exercises */}
                        <Link
                            href="/admin/workout/exercises"
                            className="block bg-surface border-2 border-primary/20 p-6 hover:border-accent transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">💪</span>
                                <h2 className="font-teko text-2xl uppercase tracking-wider text-primary">
                                    ÖVNINGAR
                                </h2>
                            </div>
                            <p className="font-inter text-sm text-primary/80">
                                Lägg till, redigera och ta bort systemövningar
                            </p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="font-inter text-xs text-primary/60">
                                    {systemExercises.length} systemövningar
                                </span>
                                <span className="text-accent">→</span>
                            </div>
                        </Link>

                        {/* Programs */}
                        <Link
                            href="/admin/workout/programs"
                            className="block bg-surface border-2 border-primary/20 p-6 hover:border-accent transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">📋</span>
                                <h2 className="font-teko text-2xl uppercase tracking-wider text-primary">
                                    PROGRAM
                                </h2>
                            </div>
                            <p className="font-inter text-sm text-primary/80">
                                Skapa och redigera träningsprogram
                            </p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="font-inter text-xs text-primary/60">
                                    {systemPrograms.length} systemprogram
                                </span>
                                <span className="text-accent">→</span>
                            </div>
                        </Link>
                    </div>

                    {/* Back Link */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/workout"
                            className="font-inter text-sm text-primary/60 hover:text-primary"
                        >
                            ← Tillbaka till träning
                        </Link>
                    </div>
                </div>
            </main>
        </MobileContainer>
    );
}
