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
    onReset: () => Promise<void>;
}

export default function SettingsModal({
    isOpen,
    onClose,
    userId,
    currentDay,
    isPremium,
    onRedeemVip,
    onReset,
}: SettingsModalProps) {
    const [loading, setLoading] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const triggerConfetti = () => {
        // ... confetti logic remains same ...
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            await onReset();

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
                    // ... existing menu ...
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
                        <div className="space-y-4 bg-status-red/10 border border-status-red p-4 rounded-lg">
                            <p className="font-teko text-2xl uppercase text-status-red text-center">
                                ⚠️ VARNING: TOTAL ÅTERSTÄLLNING
                            </p>
                            <p className="font-inter text-sm text-primary">
                                Trycker du på bekräfta så <strong>RADERAS ALL DIN HISTORIK</strong>.
                            </p>
                            <ul className="list-disc list-inside font-inter text-xs text-primary/80 space-y-1">
                                <li>Alla dagliga loggar raderas</li>
                                <li>Alla sparade bilder försvinner</li>
                                <li>Du börjar om på Dag 1</li>
                            </ul>
                            <p className="font-inter text-xs font-bold text-status-red mt-2 text-center">
                                Detta går INTE att ångra.
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
