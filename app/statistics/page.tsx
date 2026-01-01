/**
 * Statistics Page
 * Shows user progress, streaks, habit consistency, and check-in trends
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MobileContainer from '@/components/layout/MobileContainer';
import { DailyLog } from '@/types/database.types';
import { getDailyTargets, getLevelDisplayName, type DifficultyLevel } from '@/lib/gameRules';

// Helper: Calculate current streak
function calculateStreak(logs: DailyLog[]): { current: number; best: number } {
    if (!logs.length) return { current: 0, best: 0 };

    // Sort by date descending
    const sorted = [...logs].sort((a, b) =>
        new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
    );

    let current = 0;
    let best = 0;
    let tempStreak = 0;

    // Check if today or yesterday has a completed log
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let lastDate: Date | null = null;

    for (const log of sorted) {
        if (!log.is_completed) {
            // Break streak on incomplete day
            if (tempStreak > best) best = tempStreak;
            tempStreak = 0;
            continue;
        }

        const logDate = new Date(log.log_date);

        if (!lastDate) {
            // First completed log
            if (log.log_date === today || log.log_date === yesterday) {
                current = 1;
                tempStreak = 1;
            }
            lastDate = logDate;
        } else {
            const dayDiff = (lastDate.getTime() - logDate.getTime()) / 86400000;
            if (dayDiff === 1) {
                tempStreak++;
                if (log.log_date <= yesterday) {
                    current = tempStreak;
                }
            } else if (dayDiff > 1) {
                if (tempStreak > best) best = tempStreak;
                tempStreak = 1;
            }
            lastDate = logDate;
        }
    }

    if (tempStreak > best) best = tempStreak;

    return { current, best };
}

// Helper: Calculate habit completion rates
function calculateHabitRates(logs: DailyLog[], level: DifficultyLevel) {
    if (!logs.length) return {
        diet: 0,
        outdoor: 0,
        indoor: 0,
        water: 0,
        reading: 0,
        photo: 0,
    };

    const targets = getDailyTargets(level);
    const total = logs.length;

    return {
        diet: Math.round((logs.filter(l => l.diet_completed).length / total) * 100),
        outdoor: Math.round((logs.filter(l => l.workout_outdoor_completed).length / total) * 100),
        indoor: Math.round((logs.filter(l => l.workout_indoor_completed).length / total) * 100),
        water: Math.round((logs.filter(l => l.water_intake >= targets.waterLiters).length / total) * 100),
        reading: Math.round((logs.filter(l => l.reading_completed).length / total) * 100),
        photo: Math.round((logs.filter(l => l.photo_uploaded).length / total) * 100),
    };
}

// Helper: Get last 7 days check-in averages
function getCheckInTrends(logs: DailyLog[]) {
    const last7 = [...logs]
        .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())
        .slice(0, 7)
        .reverse();

    return last7.map(log => ({
        date: log.log_date,
        sleep: log.sleep_score || 0,
        energy: log.energy_score || 0,
        body: log.body_score || 0,
    }));
}

export default async function StatisticsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const level = (profile?.difficulty_level || 'hard') as DifficultyLevel;

    // Fetch all daily logs
    const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false });

    const dailyLogs = (logs || []) as DailyLog[];
    const streak = calculateStreak(dailyLogs);
    const habitRates = calculateHabitRates(dailyLogs, level);
    const trends = getCheckInTrends(dailyLogs);

    return (
        <MobileContainer>
            <div className="min-h-screen bg-background p-6 pb-28">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="font-teko text-4xl uppercase tracking-wider text-primary">
                        Din Utveckling
                    </h1>
                    <p className="font-inter text-sm text-primary/60">
                        {getLevelDisplayName(level)} · {dailyLogs.length} dagar loggade
                    </p>
                </header>

                {/* Streak Card */}
                <section className="mb-8 bg-surface border-2 border-accent/30 p-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 text-[120px] opacity-5">🔥</div>
                    <div className="relative z-10">
                        <p className="font-inter text-xs uppercase tracking-wider text-primary/60 mb-1">Nuvarande Streak</p>
                        <div className="flex items-baseline gap-2">
                            <span className="font-teko text-7xl text-accent leading-none">{streak.current}</span>
                            <span className="font-inter text-lg text-primary/60">dagar</span>
                        </div>
                        <p className="font-inter text-sm text-primary/40 mt-2">
                            Bästa streak: <span className="text-accent">{streak.best}</span> dagar
                        </p>
                    </div>
                </section>

                {/* Habit Consistency Grid */}
                <section className="mb-8">
                    <h2 className="font-teko text-2xl uppercase tracking-wider text-primary mb-4">
                        Disciplin
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <HabitCard label="Diet" value={habitRates.diet} icon="🍽️" />
                        <HabitCard label="Utomhuspass" value={habitRates.outdoor} icon="🌳" />
                        <HabitCard label="Inomhuspass" value={habitRates.indoor} icon="🏋️" />
                        <HabitCard label="Vatten" value={habitRates.water} icon="💧" />
                        <HabitCard label="Läsning" value={habitRates.reading} icon="📖" />
                        <HabitCard label="Foto" value={habitRates.photo} icon="📸" />
                    </div>
                </section>

                {/* Check-in Trends */}
                {trends.length > 0 && (
                    <section className="mb-8">
                        <h2 className="font-teko text-2xl uppercase tracking-wider text-primary mb-4">
                            Mående (Senaste 7 dagar)
                        </h2>
                        <div className="bg-surface border border-primary/20 p-4">
                            <div className="flex justify-between mb-2">
                                <span className="font-inter text-xs text-primary/60">Sömn</span>
                                <span className="font-inter text-xs text-primary/60">Energi</span>
                                <span className="font-inter text-xs text-primary/60">Kropp</span>
                            </div>
                            <div className="flex gap-2">
                                {trends.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full flex flex-col gap-1">
                                            <TrendBar value={day.sleep} color="bg-blue-500" />
                                            <TrendBar value={day.energy} color="bg-yellow-500" />
                                            <TrendBar value={day.body} color="bg-green-500" />
                                        </div>
                                        <span className="font-inter text-[8px] text-primary/40">
                                            {new Date(day.date).getDate()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center gap-4 mt-4 text-[10px] text-primary/40">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>Sömn</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span>Energi</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span>Kropp</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* Coming Soon: Calendar View */}
                <section className="opacity-50">
                    <h2 className="font-teko text-2xl uppercase tracking-wider text-primary mb-4">
                        Kalender (Kommer snart)
                    </h2>
                    <div className="bg-surface border border-primary/20 p-6 text-center">
                        <span className="text-4xl mb-2 block">📅</span>
                        <p className="font-inter text-sm text-primary/60">Månadsöverblick på väg...</p>
                    </div>
                </section>
            </div>
        </MobileContainer>
    );
}

// Sub-components
function HabitCard({ label, value, icon }: { label: string; value: number; icon: string }) {
    const getColor = (v: number) => {
        if (v >= 90) return 'text-status-green border-status-green/30';
        if (v >= 70) return 'text-yellow-500 border-yellow-500/30';
        return 'text-status-red border-status-red/30';
    };

    return (
        <div className={`bg-surface border-2 p-4 ${getColor(value)}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="font-teko text-3xl">{value}%</span>
            </div>
            <p className="font-inter text-xs uppercase tracking-wider text-primary/60">{label}</p>
        </div>
    );
}

function TrendBar({ value, color }: { value: number; color: string }) {
    // Value 1-10, scale to height
    const height = Math.max(4, (value / 10) * 24);
    return (
        <div className="w-full h-6 bg-primary/5 rounded-sm overflow-hidden flex items-end">
            <div
                className={`w-full ${color} rounded-sm transition-all`}
                style={{ height: `${height}px` }}
            />
        </div>
    );
}
