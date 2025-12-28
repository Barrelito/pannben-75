/**
 * Premium Status Hook
 * Checks user's premium access and handles VIP code redemption
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UsePremiumResult {
    isPremium: boolean;
    loading: boolean;
    error: string | null;

    refreshStatus: () => Promise<void>;
    redeemVipCode: (code: string) => Promise<{ success: boolean; error?: string }>;
}

export function usePremium(userId: string): UsePremiumResult {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const refreshStatus = useCallback(async () => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_premium')
                .eq('id', userId)
                .single();

            setIsPremium(profile?.is_premium || false);
        } catch (err) {
            console.error('Error fetching premium status:', err);
            setIsPremium(false);
        }
    }, [userId, supabase]);

    const redeemVipCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const upperCode = code.toUpperCase().trim();

            // Check if code exists and is not used
            const { data: vipCode, error: codeError } = await supabase
                .from('vip_codes')
                .select('*')
                .eq('code', upperCode)
                .eq('is_used', false)
                .maybeSingle();

            if (codeError) {
                return { success: false, error: 'Kunde inte kontrollera koden' };
            }

            if (!vipCode) {
                return { success: false, error: 'Ogiltig eller redan använd kod' };
            }

            // Claim the code
            const { error: claimError } = await supabase
                .from('vip_codes')
                .update({
                    is_used: true,
                    claimed_by: userId,
                    claimed_at: new Date().toISOString(),
                })
                .eq('id', vipCode.id);

            if (claimError) {
                return { success: false, error: 'Kunde inte aktivera koden' };
            }

            // Update profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ is_premium: true })
                .eq('id', userId);

            if (profileError) {
                return { success: false, error: 'Kunde inte uppdatera profil' };
            }

            // Refresh status
            await refreshStatus();

            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message || 'Ett fel uppstod' };
        }
    }, [userId, supabase, refreshStatus]);

    // Initial load
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await refreshStatus();
            setLoading(false);
        };

        init();
    }, [refreshStatus]);

    return {
        isPremium,
        loading,
        error,
        refreshStatus,
        redeemVipCode,
    };
}
