/**
 * Onboarding Page - MÖNSTRING
 * Multi-step introduction to the #PANNBEN75 challenge
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MobileContainer from '@/components/layout/MobileContainer';
import OnboardingSlide from '@/components/onboarding/OnboardingSlide';
import ProgressDots from '@/components/onboarding/ProgressDots';

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(0);
    const [displayName, setDisplayName] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleNext = () => {
        if (step < TOTAL_STEPS - 1) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

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

            router.push('/dashboard');
        } catch (err) {
            console.error('Onboarding error:', err);
            setError('Något gick fel. Försök igen.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <OnboardingSlide icon="⚔️" title="VAD ÄR PANNBEN75?">
                        <p className="text-lg mb-4">
                            <span className="text-accent font-semibold">75 dagar</span> av total disciplin.
                        </p>
                        <p className="text-sm text-primary/60">
                            Inga ursäkter. Inga undantag. Bara resultat.
                        </p>
                    </OnboardingSlide>
                );

            case 1:
                return (
                    <OnboardingSlide icon="📋" title="DE 5 REGLERNA">
                        <div className="text-left space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🍽️</span>
                                <span><strong className="text-accent">DIET</strong> – Följ din valda kost</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🏃</span>
                                <span><strong className="text-accent">UTOMHUS</strong> – 45 min träning</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🏋️</span>
                                <span><strong className="text-accent">INOMHUS</strong> – 45 min träning</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📖</span>
                                <span><strong className="text-accent">LÄSNING</strong> – 10 sidor</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📸</span>
                                <span><strong className="text-accent">FOTO</strong> – Progress varje dag</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                );

            case 2:
                return (
                    <OnboardingSlide icon="🌅" title="MORGONRUTIN">
                        <p className="mb-4">
                            Varje morgon kollar du in din status.
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-status-green"></span>
                                <span className="text-status-green font-semibold">GRÖN</span>
                                <span className="text-primary/60">– Kör hårt!</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-status-yellow"></span>
                                <span className="text-status-yellow font-semibold">GUL</span>
                                <span className="text-primary/60">– Ta det lugnt</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-status-red"></span>
                                <span className="text-status-red font-semibold">RÖD</span>
                                <span className="text-primary/60">– Vila smart</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                );

            case 3:
                return (
                    <OnboardingSlide icon="🛡️" title="PLUTONEN">
                        <p className="mb-4">
                            Du kämpar inte ensam.
                        </p>
                        <p className="text-sm text-primary/60 mb-4">
                            Gå med i en pluton eller skapa din egen.
                            Håll varandra ansvariga. Fira vinster tillsammans.
                        </p>
                        <p className="text-accent font-semibold">
                            Brödraskap. Disciplin. Seger.
                        </p>
                    </OnboardingSlide>
                );

            case 4:
                return (
                    <OnboardingSlide icon="📲" title="SPARA APPEN">
                        <p className="mb-4">
                            Lägg till appen på din hemskärm för snabb åtkomst.
                        </p>

                        {/* iOS Instructions */}
                        <div className="bg-surface border-2 border-primary/20 p-4 mb-3 text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">📱</span>
                                <span className="font-semibold text-accent">iPhone / iPad</span>
                            </div>
                            <p className="text-sm text-primary/80">
                                Safari → Dela-knapp → "Lägg till på hemskärmen"
                            </p>
                        </div>

                        {/* Android Instructions */}
                        <div className="bg-surface border-2 border-primary/20 p-4 text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">🤖</span>
                                <span className="font-semibold text-accent">Android</span>
                            </div>
                            <p className="text-sm text-primary/80">
                                Chrome → ⋮ meny → "Lägg till på startskärmen"
                            </p>
                        </div>
                    </OnboardingSlide>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⚔️</div>
                            <h2 className="font-teko text-4xl uppercase tracking-wider text-accent mb-2">
                                MÖNSTRING
                            </h2>
                            <p className="font-inter text-sm text-primary/80">
                                Innan du kliver in i ledet måste vi veta vem du är.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        Jag förstår att detta är 75 dagar av disciplin. <span className="text-accent font-semibold">Inga ursäkter.</span>
                                    </span>
                                </label>
                            </div>

                            {error && (
                                <div className="bg-status-red/10 border-2 border-status-red p-4 text-center">
                                    <p className="font-inter text-sm text-status-red">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || !displayName.trim() || !acceptedTerms}
                                className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'REGISTRERAR...' : '⚔️ KLIV IN I LEDET'}
                            </button>
                        </form>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <MobileContainer>
            <div className="min-h-screen bg-background flex flex-col p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-teko font-bold uppercase tracking-wider leading-none">
                        <span className="block text-5xl text-primary">#PANNBEN</span>
                        <span className="block text-6xl text-accent -mt-2">75</span>
                    </h1>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                    {renderStep()}
                </div>

                {/* Navigation */}
                <div className="space-y-6 pt-8">
                    {/* Progress Dots */}
                    <ProgressDots total={TOTAL_STEPS} current={step} />

                    {/* Buttons */}
                    {step < TOTAL_STEPS - 1 && (
                        <div className="flex gap-3">
                            {step > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="flex-1 px-6 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-primary transition-all"
                                >
                                    ← TILLBAKA
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className={`${step === 0 ? 'w-full' : 'flex-1'} px-6 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all`}
                            >
                                NÄSTA →
                            </button>
                        </div>
                    )}

                    {step === TOTAL_STEPS - 1 && step > 0 && (
                        <button
                            onClick={handleBack}
                            className="w-full px-6 py-3 text-primary/60 font-inter text-sm uppercase tracking-wider hover:text-accent transition-all"
                        >
                            ← TILLBAKA
                        </button>
                    )}
                </div>
            </div>
        </MobileContainer>
    );
}
