/**
 * useDailyLog Hook
 * Manages daily log CRUD operations, grace period checking, and streak validation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyLog } from '@/types/database.types';
import type {
    MorningScoresUI,
    RuleName,
    PlanningData,
    GracePeriodResult,
    ScoreUI
} from '@/types/logic.types';
import { calculateRecoveryStatus } from '@/lib/logic/recovery';
import { convertScoresToDb } from '@/lib/utils/scales';
import { getToday, getYesterday, getDayNumber } from '@/lib/utils/dates';
import { calculateDailyXP, XP_VALUES, type DifficultyLevel } from '@/lib/gamification';

interface UseDailyLogResult {
    log: DailyLog | null;
    loading: boolean;
    error: string | null;
    gracePeriod: GracePeriodResult | null;
    fetchLog: (date: string) => Promise<void>;
    checkGracePeriod: () => Promise<GracePeriodResult>;
    submitMorningCheckin: (scores: MorningScoresUI) => Promise<void>;
    toggleRule: (rule: RuleName, value: boolean) => Promise<void>;
    updateWaterIntake: (liters: number) => Promise<void>;
    updatePlanning: (planning: PlanningData) => Promise<void>;
    completeDay: () => Promise<void>;
    logBonusWorkout: () => Promise<number>;
    toggleHardWorkout: (value: boolean) => Promise<void>;
    getWeeklyHardWorkouts: () => Promise<number>;
    resetProgress: () => Promise<void>;
    refreshLog: () => Promise<void>;
}

export function useDailyLog(userId: string): UseDailyLogResult {
    const [log, setLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gracePeriod, setGracePeriod] = useState<GracePeriodResult | null>(null);

    const supabase = createClient();

    /**
     * Fetch daily log for a specific date
     */
    const fetchLog = useCallback(async (date: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('log_date', date)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                // PGRST116 = no rows returned, which is fine
                throw fetchError;
            }

            setLog(data || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch log');
            console.error('Error fetching log:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, supabase]);

    /**
     * Check grace period - determines if user can log today or must complete yesterday
     * Also detects if streak is broken (more than 1 day missed)
     */
    const checkGracePeriod = useCallback(async (): Promise<GracePeriodResult> => {
        try {
            // Get user profile to find start_date
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('start_date')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            // If no start date, user hasn't started challenge
            // @ts-ignore - Supabase type issue with select subset
            if (!profile || !profile.start_date) {
                const result: GracePeriodResult = {
                    canLogToday: true,
                    mustLogYesterday: false,
                    currentDay: 0,
                    message: 'No challenge started yet',
                    streakBroken: false,
                    daysMissed: 0,
                };
                setGracePeriod(result);
                return result;
            }

            const today = getToday();
            const yesterday = getYesterday();
            // @ts-ignore - Supabase type issue with select subset
            const currentDay = getDayNumber(profile.start_date as string, today);

            // Day 1: No grace period check needed
            if (currentDay === 1) {
                const result: GracePeriodResult = {
                    canLogToday: true,
                    mustLogYesterday: false,
                    currentDay: 1,
                    streakBroken: false,
                    daysMissed: 0,
                };
                setGracePeriod(result);
                return result;
            }

            // Get the MOST RECENT log entry for this user
            const { data: recentLog, error: logError } = await supabase
                .from('daily_logs')
                .select('log_date')
                .eq('user_id', userId)
                .order('log_date', { ascending: false })
                .limit(1)
                .single();

            if (logError && logError.code !== 'PGRST116') {
                throw logError;
            }

            // Calculate days since last log
            let daysMissed = 0;
            let lastLogDate: string | undefined;

            if (recentLog) {
                lastLogDate = recentLog.log_date;
                const lastLog = new Date(recentLog.log_date);
                const todayDate = new Date(today);
                const diffTime = todayDate.getTime() - lastLog.getTime();
                daysMissed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            } else {
                // No logs at all - count from start_date
                // @ts-ignore - Supabase type issue with select subset
                const startDate = new Date(profile.start_date);
                const todayDate = new Date(today);
                const diffTime = todayDate.getTime() - startDate.getTime();
                daysMissed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            }

            // Determine streak status:
            // 0 days missed = logged today or it's day 1
            // 1 day missed = yesterday not logged, can still backlog
            // >1 days missed = streak broken, must reset

            const streakBroken = daysMissed > 1;
            const mustLogYesterday = daysMissed === 1;
            const canLogToday = daysMissed === 0;

            const result: GracePeriodResult = {
                canLogToday,
                mustLogYesterday,
                currentDay,
                streakBroken,
                daysMissed,
                lastLogDate,
                message: streakBroken
                    ? `Du har missat ${daysMissed} dagar. Utmaningen måste startas om.`
                    : mustLogYesterday
                        ? 'Glömde du logga gårdagen?'
                        : undefined,
            };

            setGracePeriod(result);
            return result;
        } catch (err) {
            console.error('Error checking grace period:', err);
            const fallback: GracePeriodResult = {
                canLogToday: true,
                mustLogYesterday: false,
                currentDay: 0,
                message: 'Error checking streak',
                streakBroken: false,
                daysMissed: 0,
            };
            setGracePeriod(fallback);
            return fallback;
        }
    }, [userId, supabase]);

    /**
     * Submit morning check-in scores
     */
    const submitMorningCheckin = useCallback(async (scores: MorningScoresUI) => {
        setLoading(true);
        setError(null);

        try {
            // Convert UI scores (0-2) to DB scores (1-10)
            const dbScores = convertScoresToDb(scores as unknown as Record<string, ScoreUI>);

            // Calculate recovery status
            const recovery = calculateRecoveryStatus(scores);

            const today = getToday();

            // Upsert the log
            const { error: upsertError } = await supabase
                .from('daily_logs')
                .upsert({
                    user_id: userId,
                    log_date: today,
                    sleep_score: dbScores.sleep,
                    body_score: dbScores.body,
                    energy_score: dbScores.energy,
                    stress_score: dbScores.stress,
                    motivation_score: dbScores.motivation,
                } as any, {
                    onConflict: 'user_id,log_date',
                });

            if (upsertError) throw upsertError;

            // Update profile with recovery status AND start_date if missing
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('start_date')
                .eq('id', userId)
                .single();

            const profileUpdates: any = { recovery_status: recovery.status };

            // If this is the FIRST check-in (no start_date), set it!
            if (!currentProfile?.start_date) {
                profileUpdates.start_date = today;
                profileUpdates.current_day = 1; // Start at Day 1
            }

            // @ts-ignore - Supabase type issue
            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdates)
                .eq('id', userId);

            if (profileError) throw profileError;

            // Refresh the log
            await fetchLog(today);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit check-in');
            console.error('Error submitting check-in:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchLog]);

    /**
     * Toggle a rule completion
     */
    const toggleRule = useCallback(async (rule: RuleName, value: boolean) => {
        setLoading(true);
        setError(null);

        try {
            const today = getToday();

            const { error: upsertError } = await supabase
                .from('daily_logs')
                .upsert({
                    user_id: userId,
                    log_date: today,
                    [rule]: value,
                } as any, {
                    onConflict: 'user_id,log_date',
                });

            if (upsertError) throw upsertError;

            await fetchLog(today);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update rule');
            console.error('Error toggling rule:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchLog]);

    /**
     * Update water intake
     */
    const updateWaterIntake = useCallback(async (liters: number) => {
        setLoading(true);
        setError(null);

        try {
            const today = getToday();

            const { error: upsertError } = await supabase
                .from('daily_logs')
                .upsert({
                    user_id: userId,
                    log_date: today,
                    water_intake: liters,
                } as any, {
                    onConflict: 'user_id,log_date',
                });

            if (upsertError) throw upsertError;

            await fetchLog(today);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update water intake');
            console.error('Error updating water:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchLog]);

    /**
     * Update planning for tomorrow (Night Watch)
     */
    const updatePlanning = useCallback(async (planning: PlanningData) => {
        setLoading(true);
        setError(null);

        try {
            const today = getToday();

            const { error: upsertError } = await supabase
                .from('daily_logs')
                .upsert({
                    user_id: userId,
                    log_date: today,
                    ...planning,
                } as any, {
                    onConflict: 'user_id,log_date',
                });

            if (upsertError) throw upsertError;

            await fetchLog(today);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update planning');
            console.error('Error updating planning:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchLog]);

    /**
     * Mark day as completed and award XP
     */
    const completeDay = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const today = getToday();

            // Get user's difficulty level
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('difficulty_level, total_xp')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            // @ts-ignore - Supabase type issue
            const difficultyLevel: DifficultyLevel = profile?.difficulty_level || 'hard';
            // @ts-ignore - Supabase type issue
            const currentXP = profile?.total_xp || 0;

            // Calculate XP reward (base + level bonus)
            const xpReward = calculateDailyXP(difficultyLevel, 0);
            const newTotalXP = currentXP + xpReward;

            // Update daily log as completed
            const { error: upsertError } = await supabase
                .from('daily_logs')
                .upsert({
                    user_id: userId,
                    log_date: today,
                    is_completed: true,
                } as any, {
                    onConflict: 'user_id,log_date',
                });

            if (upsertError) throw upsertError;

            // Update profile with new XP total
            const { error: xpError } = await supabase
                .from('profiles')
                .update({ total_xp: newTotalXP })
                .eq('id', userId);

            if (xpError) throw xpError;

            await fetchLog(today);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete day');
            console.error('Error completing day:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchLog]);

    /**
     * Log bonus workout and award 20 XP (max 1 per day)
     * Returns the new total XP for instant UI update
     */
    const logBonusWorkout = useCallback(async (): Promise<number> => {
        setLoading(true);
        setError(null);

        try {
            const today = getToday();

            // First check if bonus was already registered today
            const { data: todayLog, error: logError } = await supabase
                .from('daily_logs')
                .select('bonus_completed')
                .eq('user_id', userId)
                .eq('log_date', today)
                .single();

            if (logError && logError.code !== 'PGRST116') throw logError;

            // If bonus already registered today, abort
            if (todayLog?.bonus_completed) {
                throw new Error('Bonus workout already registered today');
            }

            // Get current XP
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('total_xp')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            // @ts-ignore - Supabase type issue
            const currentXP = profile?.total_xp || 0;
            const newTotalXP = currentXP + XP_VALUES.BONUS_WORKOUT;

            // Update daily log to mark bonus as completed
            const { error: upsertError } = await supabase
                .from('daily_logs')
                .upsert({
                    user_id: userId,
                    log_date: today,
                    bonus_completed: true,
                } as any, {
                    onConflict: 'user_id,log_date',
                });

            if (upsertError) throw upsertError;

            // Update profile with bonus XP
            const { error: xpError } = await supabase
                .from('profiles')
                .update({ total_xp: newTotalXP })
                .eq('id', userId);

            if (xpError) throw xpError;

            // Refresh log to get updated bonus_completed state
            await fetchLog(today);

            // Return new XP total for instant UI update
            return newTotalXP;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to log bonus workout');
            console.error('Error logging bonus workout:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchLog]);

    /**
     * Toggle hard workout flag for today (Medium level)
     */
    const toggleHardWorkout = useCallback(async (value: boolean) => {
        setLoading(true);
        setError(null);

        try {
            const today = getToday();

            const { error: upsertError } = await supabase
                .from('daily_logs')
                .upsert({
                    user_id: userId,
                    log_date: today,
                    is_hard_workout: value,
                } as any, {
                    onConflict: 'user_id,log_date',
                });

            if (upsertError) throw upsertError;

            await fetchLog(today);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle hard workout');
            console.error('Error toggling hard workout:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchLog]);

    /**
     * Get count of hard workouts for the current week (Monday-Sunday)
     */
    const getWeeklyHardWorkouts = useCallback(async (): Promise<number> => {
        try {
            // Calculate start and end of current week (Monday to Sunday)
            const now = new Date();
            const dayOfWeek = now.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

            const monday = new Date(now);
            monday.setDate(now.getDate() + diffToMonday);
            monday.setHours(0, 0, 0, 0);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            const mondayStr = monday.toISOString().split('T')[0];
            const sundayStr = sunday.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('daily_logs')
                .select('is_hard_workout')
                .eq('user_id', userId)
                .eq('is_hard_workout', true)
                .gte('log_date', mondayStr)
                .lte('log_date', sundayStr);

            if (error) throw error;

            return data?.length || 0;
        } catch (err) {
            console.error('Error getting weekly hard workouts:', err);
            return 0;
        }
    }, [userId, supabase]);

    /**
     * Hard Reset Progress
     * WARNING: Deletes all logs and resets profile
     */
    const resetProgress = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Delete all daily logs
            const { error: deleteError } = await supabase
                .from('daily_logs')
                .delete()
                .eq('user_id', userId);

            if (deleteError) throw deleteError;

            // 2. Reset profile stats
            // @ts-ignore - Supabase type issue
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    start_date: null,
                    current_day: 0,
                    recovery_status: null,
                    total_xp: 0, // Reset XP as well
                } as any)
                .eq('id', userId);

            if (profileError) throw profileError;

            // 3. Clear local state
            setLog(null);
            setGracePeriod(null);

            // 4. Force refresh
            await fetchLog(getToday());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset progress');
            console.error('Error resetting progress:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchLog]);

    /**
     * Refresh current log
     */
    const refreshLog = useCallback(async () => {
        await fetchLog(getToday());
    }, [fetchLog]);

    // Auto-fetch today's log on mount
    useEffect(() => {
        if (userId) {
            fetchLog(getToday());
            checkGracePeriod();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]); // Only run on mount or when userId changes

    return {
        log,
        loading,
        error,
        gracePeriod,
        fetchLog,
        checkGracePeriod,
        submitMorningCheckin,
        toggleRule,
        updateWaterIntake,
        updatePlanning,
        completeDay,
        logBonusWorkout,
        toggleHardWorkout,
        getWeeklyHardWorkouts,
        resetProgress,
        refreshLog,
    };
}
