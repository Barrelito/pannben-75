/**
 * VIP Code Redemption Component
 * For redeeming premium access codes
 */

'use client';

import { useState } from 'react';

interface RedeemVipProps {
    onRedeem: (code: string) => Promise<{ success: boolean; error?: string }>;
}

export default function RedeemVip({ onRedeem }: RedeemVipProps) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) return;

        setLoading(true);
        setMessage(null);

        const result = await onRedeem(code);

        if (result.success) {
            setMessage({ type: 'success', text: '🎉 Premium aktiverat!' });
            setCode('');
        } else {
            setMessage({ type: 'error', text: result.error || 'Ett fel uppstod' });
        }

        setLoading(false);
    };

    return (
        <div className="bg-surface border-2 border-primary/20 p-6">
            <h3 className="font-inter text-sm uppercase tracking-wider text-primary/60 mb-4">
                HAR VIP-KOD?
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXX-XX"
                    maxLength={20}
                    className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter font-mono tracking-wider focus:border-accent focus:outline-none uppercase text-center"
                />

                <button
                    type="submit"
                    disabled={loading || !code.trim()}
                    className="w-full px-6 py-3 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'KONTROLLERAR...' : 'AKTIVERA'}
                </button>
            </form>

            {message && (
                <div
                    className={`mt-4 p-3 border-2 text-center font-inter text-sm ${message.type === 'success'
                            ? 'bg-status-green/10 border-status-green text-primary'
                            : 'bg-status-red/10 border-status-red text-primary'
                        }`}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
}
