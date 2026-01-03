/**
 * Workout Settings Page
 * User's personal exercises and custom programs
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import CancelSubscription from '@/components/premium/CancelSubscription';

export default async function WorkoutSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check admin status and premium
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_premium')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const isPremium = profile?.is_premium || false;

    // Count user's custom exercises
    const { count: exerciseCount } = await supabase
        .from('exercises')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .eq('is_system', false);

    // Count user's custom programs
    const { count: programCount } = await supabase
        .from('workout_programs')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .eq('is_system', false);

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background p-6 pb-24">
                <ServerHeader />

                <div className="mb-6">
                    <h1 className="font-teko text-5xl uppercase tracking-wider text-accent mb-1">
                        INSTÄLLNINGAR
                    </h1>
                    <p className="font-inter text-primary/80 text-sm">
                        Hantera dina övningar och program.
                    </p>
                </div>

                {/* Settings Menu */}
                <div className="space-y-4">
                    {/* My Exercises */}
                    <Link
                        href="/workout/settings/exercises"
                        className="block bg-surface border border-primary/20 p-4 hover:border-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">🏋️</span>
                            <div className="flex-1">
                                <h3 className="font-teko text-xl text-primary">MINA ÖVNINGAR</h3>
                                <p className="font-inter text-xs text-primary/60">
                                    Skapa och hantera egna övningar
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary/60 text-xs font-inter">
                                    {exerciseCount || 0}
                                </span>
                                <span className="text-primary/40">→</span>
                            </div>
                        </div>
                    </Link>

                    {/* My Programs */}
                    <Link
                        href="/workout/settings/my-programs"
                        className="block bg-surface border border-primary/20 p-4 hover:border-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">📋</span>
                            <div className="flex-1">
                                <h3 className="font-teko text-xl text-primary">MINA PROGRAM</h3>
                                <p className="font-inter text-xs text-primary/60">
                                    Skapa egna träningsprogram
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary/60 text-xs font-inter">
                                    {programCount || 0}
                                </span>
                                <span className="text-primary/40">→</span>
                            </div>
                        </div>
                    </Link>

                    {/* All Exercises (Browse) */}
                    <Link
                        href="/workout/exercises"
                        className="block bg-surface border border-primary/20 p-4 hover:border-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">📚</span>
                            <div className="flex-1">
                                <h3 className="font-teko text-xl text-primary">ÖVNINGSBIBLIOTEK</h3>
                                <p className="font-inter text-xs text-primary/60">
                                    Bläddra bland alla övningar
                                </p>
                            </div>
                            <span className="text-primary/40">→</span>
                        </div>
                    </Link>
                </div>

                {/* Account / Subscription */}
                <div className="mt-8 pt-4 border-t border-primary/10">
                    <h2 className="font-teko text-lg text-primary/60 uppercase mb-3">Konto</h2>
                    <CancelSubscription isPremium={isPremium} />
                </div>

                {/* Admin Section */}
                {isAdmin && (
                    <div className="mt-8 pt-4 border-t border-primary/10">
                        <h2 className="font-teko text-lg text-primary/60 uppercase mb-3">Admin</h2>
                        <Link
                            href="/admin/workout"
                            className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 hover:border-red-500 transition-colors"
                        >
                            <span className="text-2xl">🔒</span>
                            <div className="flex-1">
                                <h3 className="font-inter text-sm text-red-400 font-semibold">
                                    Admin Panel
                                </h3>
                                <p className="font-inter text-xs text-red-300/60">
                                    Hantera systemövningar och program
                                </p>
                            </div>
                            <span className="text-red-500/40">→</span>
                        </Link>
                    </div>
                )}
            </main>
        </MobileContainer>
    );
}
