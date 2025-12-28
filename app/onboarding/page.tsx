/**
 * Onboarding Page - MÖNSTRING
 * Multi-step introduction to the #PANNBEN75 challenge
 */

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';
import OnboardingSlide from '@/components/onboarding/OnboardingSlide';
import ProgressDots from '@/components/onboarding/ProgressDots';

const TOTAL_STEPS = 8;

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(0);
    const [displayName, setDisplayName] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
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

            let avatarUrl = null;

            // Upload avatar if selected
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile);

                if (uploadError) {
                    console.error('Avatar upload error:', uploadError);
                    // Continue without avatar if upload fails, or handle error?
                    // user probably wants to know.
                } else {
                    const { data: publicUrlData } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(fileName);
                    avatarUrl = publicUrlData.publicUrl;
                }
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName.trim(),
                    avatar_url: avatarUrl
                })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                setError('Kunde inte spara profilen. Försök igen.');
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
                    <OnboardingSlide icon="🍽️" title="DIET">
                        <p className="mb-4">
                            Välj en kostplan innan du börjar.
                            Det kan vara t.ex. kaloriunderskott, keto, paleo eller makrofokus.
                        </p>
                        <div className="text-left space-y-3 bg-surface border-2 border-primary/10 p-4">
                            <p className="font-bold text-accent mb-2">Regler:</p>
                            <div className="flex items-start gap-2">
                                <span>✅</span>
                                <span>Följ samma plan alla 75 dagar</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>❌</span>
                                <span>Ingen alkohol</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>❌</span>
                                <span>Inga fuskmåltider eller snacks utanför planen</span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-primary/60">
                            👉 Byter du diet under resans gång → <span className="text-status-red font-bold">omstart dag 1</span>
                        </p>
                    </OnboardingSlide>
                );

            case 2:
                return (
                    <OnboardingSlide icon="🏃" title="TRÄNING">
                        <p className="mb-4">
                            Två separata träningspass varje dag.
                        </p>
                        <div className="text-left space-y-3 bg-surface border-2 border-primary/10 p-4 mb-4">
                            <p className="font-bold text-accent mb-2">Krav:</p>
                            <div className="flex items-center gap-2">
                                <span>⏱️</span>
                                <span>2 × 45 minuter</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>🌳</span>
                                <span>Minst ett pass <strong>utomhus</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>🕰️</span>
                                <span>Passen ska vara åtskilda i tid</span>
                            </div>
                        </div>
                        <div className="text-left text-sm space-y-2">
                            <p><strong className="text-status-green">Tillåtet:</strong> Styrka, kondition, rörlighet, promenad (om det är träning)</p>
                            <p><strong className="text-status-red">Ej tillåtet:</strong> Dubbla pass direkt efter varandra</p>
                        </div>
                    </OnboardingSlide>
                );

            case 3:
                return (
                    <OnboardingSlide icon="💧" title="VATTEN">
                        <p className="mb-4">
                            Drick <strong>3.5 liter</strong> vatten per dag.
                        </p>
                        <div className="text-left space-y-3 bg-surface border-2 border-primary/10 p-4 mb-4">
                            <p className="font-bold text-accent mb-2">Regler:</p>
                            <div className="flex items-start gap-2">
                                <span>✅</span>
                                <span>Ska vara vanligt vatten</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>✅</span>
                                <span>Ska drickas utspritt under dagen</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>❌</span>
                                <span>Kaffe, te, lightdryck eller smaksatt vatten räknas inte</span>
                            </div>
                        </div>
                        <p className="text-xs text-primary/60">
                            👉 Missar du mängden → <span className="text-status-red font-bold">omstart dag 1</span>
                        </p>
                    </OnboardingSlide>
                );

            case 4:
                return (
                    <OnboardingSlide icon="📖" title="LÄSNING">
                        <p className="mb-4">
                            Läs <strong>10 sidor</strong> varje dag.
                        </p>
                        <div className="text-left space-y-3 bg-surface border-2 border-primary/10 p-4 mb-4">
                            <p className="font-bold text-accent mb-2">Krav:</p>
                            <div className="flex items-start gap-2">
                                <span>✅</span>
                                <span>Endast facklitteratur / självutveckling</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>✅</span>
                                <span>Fysisk bok eller e-bok</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>❌</span>
                                <span>Ej skönlitteratur, ljudbok eller sammanfattningar</span>
                            </div>
                        </div>
                        <p className="text-sm italic text-primary/60">
                            "Syftet är mental disciplin, inte underhållning."
                        </p>
                    </OnboardingSlide>
                );

            case 5:
                return (
                    <OnboardingSlide icon="📸" title="PROGRESSBILD">
                        <p className="mb-4">
                            Ta en bild på dig själv varje dag.
                        </p>
                        <div className="text-left space-y-3 bg-surface border-2 border-primary/10 p-4 mb-4">
                            <p className="font-bold text-accent mb-2">Tips:</p>
                            <div className="flex items-start gap-2">
                                <span>💡</span>
                                <span>Samma tid på dagen</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>💡</span>
                                <span>Liknande ljus & vinkel</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>💡</span>
                                <span>Enkel spegelbild räcker</span>
                            </div>
                        </div>
                        <p className="text-xs text-primary/60 mb-2">
                            Bilden är för dig, inte för sociala medier.
                        </p>
                        <p className="text-xs text-primary/60">
                            👉 Glömt bilden = <span className="text-status-red font-bold">omstart dag 1</span>
                        </p>
                    </OnboardingSlide>
                );

            case 6:
                return (
                    <OnboardingSlide icon="⚠️" title="GRUNDREGELN">
                        <p className="text-xl mb-6">
                            #pannben75 är <strong className="text-accent">allt eller inget</strong>.
                        </p>
                        <div className="space-y-4 mb-8">
                            <div className="bg-status-red/10 border-2 border-status-red p-4">
                                <p className="font-bold text-status-red mb-1">Missar du en enda regel?</p>
                                <p className="font-bold text-status-red">En enda dag?</p>
                            </div>
                            <div className="text-2xl">⬇️</div>
                            <p className="font-bold text-xl">
                                Starta om från <span className="text-accent">DAG 1</span>
                            </p>
                        </div>
                        <p className="text-sm text-primary/60 italic">
                            "Detta är inte ett träningsprogram — det är ett mentalt disciplin-test."
                        </p>
                    </OnboardingSlide>
                );

            case 7:
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
                            {/* Profile Picture Upload */}
                            <div className="flex flex-col items-center space-y-3">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-24 h-24 rounded-full bg-surface border-2 border-primary/20 flex items-center justify-center cursor-pointer overflow-hidden hover:border-accent transition-all"
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl">📷</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs font-bold text-accent uppercase tracking-wider hover:text-white transition-colors"
                                >
                                    Ladda upp bild
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

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
                {/* Header */}
                <div className="mb-8">
                    <Logo />
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
