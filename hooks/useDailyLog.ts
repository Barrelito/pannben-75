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
                };
                setGracePeriod(result);
                return result;
            }

            // Check if yesterday's log exists
            const { data: yesterdayLog, error: logError } = await supabase
                .from('daily_logs')
                .select('id')
                .eq('user_id', userId)
                .eq('log_date', yesterday)
                .single();

            if (logError && logError.code !== 'PGRST116') {
                throw logError;
            }

            const yesterdayComplete = !!yesterdayLog;

            const result: GracePeriodResult = {
                canLogToday: yesterdayComplete,
                mustLogYesterday: !yesterdayComplete,
                currentDay,
                message: yesterdayComplete
                    ? undefined
                    : 'Du måste fylla i gårdagens logg först',
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
     * Mark day as completed
     */
    const completeDay = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const today = getToday();

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
        refreshLog,
    };
}
