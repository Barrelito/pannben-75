/**
 * Cancel Subscription Button Component
 * Allows premium users to cancel their subscription
 */

'use client';

import { useState } from 'react';

interface CancelSubscriptionProps {
    isPremium: boolean;
}

export default function CancelSubscription({ isPremium }: CancelSubscriptionProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'cancelled' | 'error'>('idle');

    if (!isPremium) {
        return null;
    }

    const handleCancel = async () => {
        if (!confirm('Är du säker på att du vill avsluta ditt Premium-abonnemang? Du har tillgång till Premium tills nuvarande period löper ut.')) {
            return;
        }

        setLoading(true);
        setStatus('idle');

        try {
            const response = await fetch('/api/subscription/cancel', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('cancelled');
            } else {
                throw new Error(data.error || 'Kunde inte avsluta abonnemanget');
            }
        } catch (error: any) {
            console.error('Cancel error:', error);
            setStatus('error');
            alert(error.message || 'Något gick fel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface border border-primary/20 p-4">
            <div className="flex items-center gap-4">
                <span className="text-3xl">💳</span>
                <div className="flex-1">
                    <h3 className="font-teko text-xl text-primary">ABONNEMANG</h3>
                    <p className="font-inter text-xs text-primary/60">
                        {status === 'cancelled'
                            ? 'Abonnemanget avslutas vid periodens slut'
                            : 'Du har Premium - 175 kr/år'}
                    </p>
                </div>
            </div>

            {status !== 'cancelled' && (
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="mt-4 w-full py-2 border border-red-500/30 text-red-400 text-sm font-inter hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'AVSLUTAR...' : 'AVSLUTA ABONNEMANG'}
                </button>
            )}

            {status === 'cancelled' && (
                <p className="mt-4 text-green-400 text-sm font-inter text-center">
                    ✓ Abonnemanget kommer avslutas vid periodens slut
                </p>
            )}
        </div>
    );
}
