/**
 * Settings Modal
 * User settings and reset functionality with confetti celebration
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Modal from '@/components/ui/Modal';
import RedeemVip from '@/components/premium/RedeemVip';
import CheckoutButton from '@/components/premium/CheckoutButton';
import { createClient } from '@/lib/supabase/client';
import { getToday } from '@/lib/utils/dates';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentDay: number;
    isPremium: boolean;
    onRedeemVip: (code: string) => Promise<{ success: boolean; error?: string }>;
}

export default function SettingsModal({
    isOpen,
    onClose,
    userId,
    currentDay,
    isPremium,
    onRedeemVip,
}: SettingsModalProps) {
    const [loading, setLoading] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 7,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#EAB308', '#D4D4D8', '#15803d'],
            });
            confetti({
                particleCount: 7,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#EAB308', '#D4D4D8', '#15803d'],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            // Get current highest streak
            // @ts-ignore - Supabase type issue
            const { data: profile } = await supabase
                .from('profiles')
                .select('current_day')
                .eq('id', userId)
                .single();

            // @ts-ignore - Supabase type issue
            const currentHighest = profile?.current_day || 0;

            // Check if new record
            if (currentDay > currentHighest) {
                triggerConfetti();
            }

            // Reset challenge
            // @ts-ignore - Supabase type issue
            const { error } = await supabase
                .from('profiles')
                .update({
                    start_date: getToday(),
                    current_day: 1,
                    recovery_status: 'GREEN',
                } as any)
                .eq('id', userId);

            if (error) throw error;

            // Close and refresh
            setShowResetConfirm(false);
            onClose();
            router.refresh();
        } catch (error) {
            console.error('Error resetting:', error);
            alert('Kunde inte återställa. Försök igen.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="INSTÄLLNINGAR">
            <div className="space-y-6">
                {!showResetConfirm ? (
                    <>
                        {/* Profile Link */}
                        <button
                            onClick={() => router.push('/profile')}
                            className="w-full px-6 py-4 bg-surface text-primary font-inter font-bold text-lg uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all mb-6 flex items-center justify-between group"
                        >
                            <span>👤 MIN PROFIL</span>
                            <span className="text-primary/40 group-hover:text-accent">→</span>
                        </button>

                        {/* Premium Status */}
                        {isPremium && (
                            <div className="bg-accent/10 border-2 border-accent p-4 text-center">
                                <p className="font-inter font-semibold text-accent uppercase tracking-wider">
                                    ✨ PREMIUM AKTIV
                                </p>
                            </div>
                        )}

                        {/* VIP Redemption - Only show if not premium */}
                        {!isPremium && <RedeemVip onRedeem={onRedeemVip} />}

                        {/* Checkout Button - Only show if not premium */}
                        {!isPremium && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-px bg-primary/20" />
                                    <span className="font-inter text-xs uppercase tracking-wider text-primary/60">
                                        ELLER
                                    </span>
                                    <div className="flex-1 h-px bg-primary/20" />
                                </div>
                                <CheckoutButton userId={userId} />
                            </div>
                        )}

                        {/* Danger Zone */}
                        <div className="space-y-4">
                            <h3 className="font-inter text-sm uppercase tracking-wider text-status-red">
                                DANGER ZONE
                            </h3>
                            <button
                                onClick={() => setShowResetConfirm(true)}
                                className="w-full px-6 py-3 bg-status-red text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-status-red hover:bg-transparent transition-all duration-300"
                            >
                                🔴 BÖRJA OM
                            </button>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full px-6 py-3 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all duration-300"
                        >
                            LOGGA UT
                        </button>
                    </>
                ) : (
                    <>
                        {/* Reset Confirmation */}
                        <div className="space-y-4">
                            <p className="font-inter text-primary">
                                Är du säker? Detta återställer din start_date och current_day.
                            </p>
                            <p className="font-inter text-sm text-primary/60">
                                Du är på dag <span className="text-accent font-semibold">{currentDay}</span>.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 px-6 py-3 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent transition-all"
                            >
                                AVBRYT
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-status-red text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-status-red hover:bg-transparent transition-all disabled:opacity-50"
                            >
                                {loading ? 'SPARAR...' : 'BEKRÄFTA'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
