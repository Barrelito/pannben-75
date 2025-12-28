/**
 * Onboarding Page - MÖNSTRING
 * Captures user display name before entering the challenge
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MobileContainer from '@/components/layout/MobileContainer';

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [displayName, setDisplayName] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!displayName.trim()) {
            setError('Du måste ange ett namn');
            return;
        }

        if (displayName.length > 20) {
            setError('Namn får max vara 20 tecken');
            return;
        }

        if (!acceptedTerms) {
            setError('Du måste acceptera villkoren');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('Du måste vara inloggad');
                return;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ display_name: displayName.trim() })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                setError('Kunde inte spara namnet. Försök igen.');
                return;
            }

            // Success - redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            console.error('Onboarding error:', err);
            setError('Något gick fel. Försök igen.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MobileContainer>
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="font-teko text-6xl uppercase tracking-wider text-accent mb-2">
                            #PANNBEN75
                        </h1>
                        <div className="text-6xl mb-4">⚔️</div>
                        <h2 className="font-teko text-4xl uppercase tracking-wider text-primary mb-6">
                            MÖNSTRING
                        </h2>
                        <p className="font-inter text-sm text-primary/80 leading-relaxed">
                            Innan du kliver in i ledet måste vi veta vem du är.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                                Ditt Namn / Smeknamn
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                maxLength={20}
                                placeholder="Max 20 tecken"
                                className="w-full px-4 py-4 bg-surface border-2 border-primary/20 text-primary font-inter text-lg focus:border-accent focus:outline-none"
                                disabled={submitting}
                            />
                            <div className="text-right font-inter text-xs text-primary/60">
                                {displayName.length}/20
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="bg-surface border-2 border-primary/20 p-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="mt-1 w-5 h-5 accent-accent cursor-pointer"
                                    disabled={submitting}
                                />
                                <span className="font-inter text-sm text-primary leading-relaxed">
                                    Jag förstår att detta är 75 dagar av disciplin. <span className="text-accent font-semibold">Inget gnäll.</span>
                                </span>
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-status-red/10 border-2 border-status-red p-4 text-center">
                                <p className="font-inter text-sm text-status-red">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting || !displayName.trim() || !acceptedTerms}
                            className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'REGISTRERAR...' : '⚔️ KLIV IN I LEDET'}
                        </button>
                    </form>
                </div>
            </div>
        </MobileContainer>
    );
}
