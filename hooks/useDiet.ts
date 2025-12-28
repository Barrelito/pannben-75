/**
 * Diet Management Hook
 * Handles diet track selection and rules fetching
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DietTrack } from '@/types/database.types';

interface UseDietResult {
    availableDiets: DietTrack[];
    selectedDiet: DietTrack | null;
    loading: boolean;
    error: string | null;

    selectDiet: (dietId: string) => Promise<void>;
    refreshDiet: () => Promise<void>;
}

export function useDiet(userId: string): UseDietResult {
    const [availableDiets, setAvailableDiets] = useState<DietTrack[]>([]);
    const [selectedDiet, setSelectedDiet] = useState<DietTrack | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchAvailableDiets = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('diet_tracks')
                .select('*')
                .order('name');

            if (fetchError) throw fetchError;

            setAvailableDiets(data || []);
        } catch (err: any) {
            console.error('Error fetching diets:', err);
            setError(err.message || 'Could not fetch diets');
        }
    }, [supabase]);

    const fetchSelectedDiet = useCallback(async () => {
        try {
            // Get user's selected diet ID
            const { data: profile } = await supabase
                .from('profiles')
                .select('selected_diet_id')
                .eq('id', userId)
                .single();

            if (!profile?.selected_diet_id) {
                setSelectedDiet(null);
                return;
            }

            // Fetch full diet track with rules
            const { data: diet, error: dietError } = await supabase
                .from('diet_tracks')
                .select('*')
                .eq('id', profile.selected_diet_id)
                .single();

            if (dietError) throw dietError;

            setSelectedDiet(diet);
        } catch (err: any) {
            console.error('Error fetching selected diet:', err);
            setSelectedDiet(null);
        }
    }, [userId, supabase]);

    const selectDiet = useCallback(async (dietId: string) => {
        try {
            setLoading(true);

            // Update profile with selected diet
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ selected_diet_id: dietId })
                .eq('id', userId);

            if (updateError) throw updateError;

            // Refresh selected diet
            await fetchSelectedDiet();
        } catch (err: any) {
            console.error('Error selecting diet:', err);
            setError(err.message || 'Could not select diet');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchSelectedDiet]);

    const refreshDiet = useCallback(async () => {
        await fetchSelectedDiet();
    }, [fetchSelectedDiet]);

    // Initial load
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchAvailableDiets(), fetchSelectedDiet()]);
            setLoading(false);
        };

        init();
    }, [fetchAvailableDiets, fetchSelectedDiet]);

    return {
        availableDiets,
        selectedDiet,
        loading,
        error,
        selectDiet,
        refreshDiet,
    };
}
