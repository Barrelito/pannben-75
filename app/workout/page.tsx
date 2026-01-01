/**
 * Workout Home Page
 * Shows 7-day training overview and user's active programs
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import RunningProgressCard from '@/components/workout-log/RunningProgressCard';
import QuickLogWorkoutButton from '@/components/workout/QuickLogWorkoutButton';

// Helper to get day name
const DAY_NAMES = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön'];

export default async function WorkoutHomePage() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check for admin and premium status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_premium')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.is_admin || false;
    const isPremium = profile?.is_premium || false;

    // Fetch user's program subscriptions
    const { data: userPrograms } = await supabase
        .from('user_programs')
        .select(`
            *,
            program:workout_programs(*)
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'paused'])
        .order('started_at', { ascending: false });

    // Fetch last 7 days of workout sessions (for the weekly overview)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const { data: recentSessions } = await supabase
        .from('workout_sessions')
        .select('id, started_at, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('started_at', sevenDaysAgo.toISOString())
        .order('started_at', { ascending: true });

    // Build 7-day activity map
    const today = new Date();
    const weekActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayIndex = (date.getDay() + 6) % 7; // Monday = 0
        const hasWorkout = recentSessions?.some(s =>
            s.started_at.split('T')[0] === dateStr
        ) || false;

        return {
            date: dateStr,
            dayName: DAY_NAMES[dayIndex],
            hasWorkout,
            isToday: i === 6,
        };
    });

    const myPrograms = userPrograms || [];

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background p-6 pb-24">
                {/* Header */}
                <ServerHeader />

                {/* Title */}
                <div className="mb-6">
                    <h1 className="font-teko text-5xl uppercase tracking-wider text-accent mb-1">
                        TRÄNINGSLOGG
                    </h1>
                    <p className="font-inter text-primary/80 text-sm">
                        Din träning, din utveckling.
                    </p>
                </div>

                {/* Premium Check */}
                {!isPremium && (
                    <div className="mb-6 p-4 bg-accent/10 border border-accent/30">
                        <p className="font-inter text-sm text-accent">
                            🔒 Träningsloggen är en premium-funktion. Uppgradera för att låsa upp.
                        </p>
                    </div>
                )}

                {/* 7-Day Activity Overview */}
                <section className="mb-8">
                    <h2 className="font-teko text-xl uppercase tracking-wider text-primary/80 mb-3">
                        Senaste 7 dagarna
                    </h2>
                    <div className="flex justify-between gap-1">
                        {weekActivity.map((day, i) => (
                            <div
                                key={day.date}
                                className="flex flex-col items-center"
                            >
                                <span className={`text-[10px] font-inter mb-1 ${day.isToday ? 'text-accent font-bold' : 'text-primary/60'
                                    }`}>
                                    {day.dayName}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${day.hasWorkout
                                    ? 'bg-accent border-accent text-background'
                                    : day.isToday
                                        ? 'border-accent/50 text-accent'
                                        : 'border-primary/20 text-primary/40'
                                    }`}>
                                    {day.hasWorkout ? '✓' : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-center font-inter text-xs text-primary/50">
                        {recentSessions?.length || 0} pass denna vecka
                    </p>
                </section>

                {/* My Programs */}
                <section className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-teko text-xl uppercase tracking-wider text-primary/80">
                            Mina Program
                        </h2>
                        <Link
                            href="/workout/programs"
                            className="font-inter text-xs text-accent hover:underline"
                        >
                            Se alla →
                        </Link>
                    </div>

                    {myPrograms.length === 0 ? (
                        <div className="p-6 border border-dashed border-primary/20 text-center">
                            <p className="font-inter text-sm text-primary/60 mb-3">
                                Du följer inga program ännu.
                            </p>
                            <Link
                                href="/workout/programs"
                                className="inline-block px-4 py-2 bg-accent text-background font-inter font-semibold text-sm uppercase"
                            >
                                Välj program
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myPrograms.map((up: any) => (
                                <div
                                    key={up.id}
                                    className="bg-surface border border-primary/20 p-4"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-teko text-xl text-primary">
                                                {up.program?.name}
                                            </h3>
                                            <p className="font-inter text-xs text-primary/60">
                                                Vecka {up.current_week} • Dag {up.current_day}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs font-inter uppercase ${up.status === 'active'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {up.status === 'active' ? 'Aktiv' : 'Pausad'}
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mb-3">
                                        <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent"
                                                style={{
                                                    width: `${((up.current_week - 1) / (up.program?.duration_weeks || 4)) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <Link
                                        href={`/workout/log?program=${up.program_id}`}
                                        className="block w-full py-2 bg-accent text-background font-inter font-semibold text-sm uppercase text-center"
                                    >
                                        Starta nästa pass
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Quick Actions */}
                <section className="space-y-3">
                    {/* Running Coach with Progress - HIDDEN TEMPORARILY
                    <RunningProgressCard />
                    */}

                    {/* Log Custom Workout */}
                    <QuickLogWorkoutButton />
                </section>

                {/* Admin Link - Only for admins */}
                {isAdmin && (
                    <div className="mt-8 pt-4 border-t border-primary/10">
                        <Link
                            href="/admin/workout"
                            className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-500/30 hover:border-red-500 transition-colors"
                        >
                            <span className="text-xl">🔒</span>
                            <div>
                                <span className="font-inter text-sm text-red-400">Admin Panel</span>
                            </div>
                        </Link>
                    </div>
                )}
            </main>
        </MobileContainer>
    );
}
