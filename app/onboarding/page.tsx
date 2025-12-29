/**
 * Onboarding Page - MÖNSTRING
 * Multi-step introduction with level selection
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';
import OnboardingSlide from '@/components/onboarding/OnboardingSlide';
import ProgressDots from '@/components/onboarding/ProgressDots';
import LevelSelector from '@/components/onboarding/LevelSelector';
import { LEVEL_INFO } from '@/lib/onboardingData';
import { getDailyTargets, type DifficultyLevel } from '@/lib/gameRules';
import Modal from '@/components/ui/Modal'; // Assuming generic Modal is available or use logic inline

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null);
    const [step, setStep] = useState(0);
    const [displayName, setDisplayName] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get steps count based on level (Level Selector is step 0)
    const getStepsForLevel = (level: DifficultyLevel | null): number => {
        if (!level) return 1; // Just level selector
        // Level selector + level-specific slides + registration
        const slideCount = {
            easy: 7,    // Welcome, Diet, Training, Water, Reading, Photo (optional), Ready
            medium: 8,  // Welcome, Diet, Training, Water, Reading, Photo, Rule, Ready
            hard: 8,    // Welcome, Diet, Training, Water, Reading, Photo, Rule, Muster
        };
        return 1 + slideCount[level]; // +1 for level selector
    };

    const TOTAL_STEPS = getStepsForLevel(selectedLevel);

    const [availableDiets, setAvailableDiets] = useState<any[]>([]);
    const [selectedDietId, setSelectedDietId] = useState<string | null>(null);
    const [viewingDietRules, setViewingDietRules] = useState<any | null>(null);

    // Fetch diets and user profile on mount
    useEffect(() => {
        const initData = async () => {
            // Fetch diets
            const { data: diets } = await supabase
                .from('diet_tracks')
                .select('*')
                .order('name');
            if (diets) setAvailableDiets(diets);

            // Fetch user profile (to pre-fill if restarting)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('display_name, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    if (profile.display_name) setDisplayName(profile.display_name);
                    if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
                }
            }
        };
        initData();
    }, [supabase]);

    const handleLevelSelect = (level: DifficultyLevel) => {
        setSelectedLevel(level);
        setStep(1); // Move to first content slide
    };

    const handleNext = () => {
        // Validation for Diet step (index 1) on Hard level
        if (step === 1 + (selectedLevel ? 0 : 0) && selectedLevel === 'hard' && !selectedDietId) {
            // Adjust index logic: step 0 is level selector. step 1 is first slide (Welcome).
            // Actually:
            // Step 0: Selector
            // Step 1: Welcome
            // Step 2: Diet
            // Let's check the renderStep switch logic:
            // contentStep = step - 1;
            // case 1 is Diet. So step = 2 is Diet.
            // Wait, previous code says case 1: Diet.
        }

        // Correct logic based on renderStep:
        // step 0 = Level Selector
        // step 1 (contentStep 0) = Welcome
        // step 2 (contentStep 1) = Diet

        if (step === 2 && (selectedLevel === 'hard' || selectedLevel === 'medium') && !selectedDietId) {
            setError('Du måste välja en diet för att gå vidare.');
            return;
        }

        setError('');

        if (step < TOTAL_STEPS - 1) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
            setError('');
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

                if (!uploadError) {
                    const { data: publicUrlData } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(fileName);
                    avatarUrl = publicUrlData.publicUrl;
                }
            }

            // Save profile with selected difficulty level and diet
            const updateData: any = {
                display_name: displayName.trim(),
                difficulty_level: selectedLevel || 'hard',
            };

            // Only update avatar if a new one was uploaded
            if (avatarUrl) {
                updateData.avatar_url = avatarUrl;
            }

            // Only save diet if one was selected (required for hard, optional/null otherwise?)
            // Actually, for easy/medium we might not set it, or set null.
            if (selectedDietId) {
                updateData.selected_diet_id = selectedDietId;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
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

    // Get targets for the selected level
    const targets = selectedLevel ? getDailyTargets(selectedLevel) : null;
    const levelInfo = selectedLevel ? LEVEL_INFO[selectedLevel] : null;

    // Helper to render diet rules (reused from DietModal logic)
    const renderDietRules = (rules: any) => {
        if (!rules) return null;
        return (
            <div className="space-y-4">
                {rules.allowed && rules.allowed.length > 0 && (
                    <div>
                        <h3 className="font-inter text-xs uppercase tracking-wider text-status-green mb-2">✓ TILLÅTET</h3>
                        <ul className="space-y-1">
                            {rules.allowed.map((item: string, idx: number) => (
                                <li key={idx} className="font-inter text-sm text-primary/80">• {item}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {rules.avoid && rules.avoid.length > 0 && (
                    <div>
                        <h3 className="font-inter text-xs uppercase tracking-wider text-status-red mb-2">✗ UNDVIK</h3>
                        <ul className="space-y-1">
                            {rules.avoid.map((item: string, idx: number) => (
                                <li key={idx} className="font-inter text-sm text-primary/80">• {item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const renderStep = () => {
        // Step 0: Level Selection
        if (step === 0) {
            return <LevelSelector onSelect={handleLevelSelect} />;
        }

        if (!selectedLevel || !targets || !levelInfo) return null;

        // Map content step (step - 1 since step 0 is level selector)
        const contentStep = step - 1;

        // Content slides based on level
        switch (contentStep) {
            case 0: // Welcome slide
                return (
                    <OnboardingSlide icon={levelInfo.emoji} title={`VÄLKOMMEN TILL ${levelInfo.name}`}>
                        <p className="text-lg mb-4">
                            <span className="text-accent font-semibold">75 dagar</span> av {selectedLevel === 'hard' ? 'total disciplin' : 'byggande av vanor'}.
                        </p>
                        <p className="text-sm text-primary/60">
                            {levelInfo.description}
                        </p>
                    </OnboardingSlide>
                );

            case 1: // Diet
                if (selectedLevel === 'hard' || selectedLevel === 'medium') {
                    return (
                        <>
                            <OnboardingSlide icon="🍽️" title="VÄLJ DIN DIET">
                                <p className="mb-6">
                                    För <strong>{selectedLevel === 'hard' ? 'PANNBEN' : 'GLÖDEN'}</strong> ({selectedLevel === 'hard' ? 'Hard' : 'Medium'}) väljer du en kostplan att följa.
                                </p>
                                <div className="space-y-4">
                                    {availableDiets.map((diet) => (
                                        <div
                                            key={diet.id}
                                            onClick={() => setSelectedDietId(diet.id)}
                                            className={`relative p-4 border-2 transition-all cursor-pointer ${selectedDietId === diet.id
                                                ? 'bg-accent/10 border-accent'
                                                : 'bg-surface border-primary/20 hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`font-teko text-2xl uppercase tracking-wider ${selectedDietId === diet.id ? 'text-accent' : 'text-primary'
                                                    }`}>
                                                    {diet.name}
                                                </h3>
                                                {selectedDietId === diet.id && (
                                                    <span className="text-xl">✅</span>
                                                )}
                                            </div>
                                            <p className="font-inter text-sm text-primary/80 mb-3">
                                                {diet.description}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewingDietRules(diet);
                                                }}
                                                className="text-xs font-bold uppercase tracking-wider text-primary/60 hover:text-accent underline"
                                            >
                                                LÄS REGLER
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </OnboardingSlide>

                            {/* Rules Modal */}
                            {viewingDietRules && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setViewingDietRules(null)}>
                                    <div className="bg-surface border-2 border-accent w-full max-w-md max-h-[80vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h2 className="font-teko text-3xl uppercase tracking-wider text-accent">
                                                    {viewingDietRules.name}
                                                </h2>
                                                <p className="font-inter text-sm text-primary/60">Regler</p>
                                            </div>
                                            <button
                                                onClick={() => setViewingDietRules(null)}
                                                className="text-2xl text-primary/60 hover:text-primary"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {renderDietRules(viewingDietRules.rules)}
                                        <button
                                            onClick={() => setViewingDietRules(null)}
                                            className="w-full mt-6 px-6 py-3 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider hover:bg-white transition-colors"
                                        >
                                            STÄNG
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    );
                }

                // Default view for Easy/Medium
                return (
                    <OnboardingSlide icon="🍽️" title="DIET">
                        <p className="mb-4">
                            {selectedLevel === 'easy'
                                ? 'Undvik godis och skräpmat på vardagar.'
                                : 'Inget socker eller skräpmat. Ingen alkohol på vardagar.'}
                        </p>
                        <div className="text-left space-y-3 bg-surface border-2 border-primary/10 p-4">
                            <p className="font-bold text-accent mb-2">Regler:</p>
                            {targets.dietRules.map((rule, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span>✅</span>
                                    <span>{rule}</span>
                                </div>
                            ))}
                        </div>
                    </OnboardingSlide>
                );

            case 2: // Training - with level-specific titles
                const trainingTitle = selectedLevel === 'easy'
                    ? 'DAGLIG RÖRELSE'
                    : selectedLevel === 'medium'
                        ? 'AKTIVITET & PULS'
                        : 'TRÄNING';
                const trainingIcon = selectedLevel === 'hard' ? '🏃' : '🚶';

                return (
                    <OnboardingSlide icon={trainingIcon} title={trainingTitle}>
                        <p className="mb-4">
                            {selectedLevel === 'easy'
                                ? 'Rör på dig 30 minuter varje dag. Promenad, trädgårdsarbete eller lek.'
                                : selectedLevel === 'medium'
                                    ? '30 min daglig aktivitet. PLUS 2 tuffa träningspass (45 min) i veckan.'
                                    : 'Två separata träningspass varje dag.'}
                        </p>
                        <div className="text-left space-y-3 bg-surface border-2 border-primary/10 p-4 mb-4">
                            <p className="font-bold text-accent mb-2">Krav:</p>
                            {selectedLevel === 'easy' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span>🚶</span>
                                        <span>30 min aktivitet/dag</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>🏠</span>
                                        <span>Valfri plats (inne/ute)</span>
                                    </div>
                                </>
                            )}
                            {selectedLevel === 'medium' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span>🚶</span>
                                        <span>Daglig aktivitet (30 min)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>💪</span>
                                        <span>2 Tuffa pass/vecka (45 min)</span>
                                    </div>
                                </>
                            )}
                            {selectedLevel === 'hard' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span>🏋️</span>
                                        <span>2 × 45 min pass/dag</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>🌳</span>
                                        <span>Minst ett pass <strong>utomhus</strong></span>
                                    </div>
                                </>
                            )}
                        </div>
                    </OnboardingSlide>
                );

            case 3: // Water
                return (
                    <OnboardingSlide icon="💧" title="VATTEN">
                        <p className="mb-4">
                            Drick <strong>{targets.waterDisplay}</strong> vatten per dag.
                        </p>
                        <div className="text-left space-y-3 bg-surface border-2 border-primary/10 p-4 mb-4">
                            <p className="font-bold text-accent mb-2">Regler:</p>
                            <div className="flex items-start gap-2">
                                <span>✅</span>
                                <span>Ska vara vanligt vatten</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>✅</span>
                                <span>Utspritt under dagen</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>❌</span>
                                <span>Kaffe, te, lightdryck räknas inte</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                );

            case 4: // Reading
                return (
                    <OnboardingSlide icon="📖" title="LÄSNING">
                        <p className="mb-4">
                            Läs <strong>{targets.readingDisplay}</strong> varje dag.
                        </p>
                        <div className="text-left space-y-3 bg-surface border-2 border-primary/10 p-4 mb-4">
                            <p className="font-bold text-accent mb-2">Krav:</p>
                            <div className="flex items-start gap-2">
                                <span>✅</span>
                                <span>{selectedLevel === 'hard' ? 'Endast facklitteratur / självutveckling' : 'Valfri bok'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>✅</span>
                                <span>Fysisk bok eller e-bok</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>❌</span>
                                <span>Ej ljudbok eller sammanfattningar</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                );

            case 5: // Photo
                return (
                    <OnboardingSlide icon="📸" title={targets.photoRequired ? 'PROGRESSBILD' : 'FOTO (VALFRITT)'}>
                        <p className="mb-4">
                            {targets.photoRequired
                                ? 'Ta en bild på dig själv varje dag.'
                                : 'Ta gärna en bild på dig själv (frivilligt).'}
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
                        {!targets.photoRequired && (
                            <p className="text-sm text-primary/60 italic">
                                Foto är valfritt på denna nivå.
                            </p>
                        )}
                    </OnboardingSlide>
                );

            case 6: // Rule slide (medium/hard) or Ready (easy)
                if (selectedLevel === 'easy') {
                    // Easy: Ready slide
                    return (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-6xl mb-4">⚔️</div>
                                <h2 className="font-teko text-4xl uppercase tracking-wider text-accent mb-2">
                                    MÖNSTRING
                                </h2>
                                <p className="font-inter text-sm text-primary/80">
                                    Innan du börjar måste vi veta vem du är.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {renderRegistrationForm()}
                            </form>
                        </div>
                    );
                }
                // Medium/Hard: Grundregeln
                return (
                    <OnboardingSlide icon="⚠️" title="GRUNDREGELN">
                        <p className="text-xl mb-6">
                            {levelInfo.name} är <strong className="text-accent">allt eller inget</strong>.
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

            case 7: // Registration (medium/hard)
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
                            {renderRegistrationForm()}
                        </form>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderRegistrationForm = () => (
        <>
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
                        Jag förstår reglerna för <span className="text-accent font-semibold">{levelInfo?.name}</span>. {selectedLevel === 'hard' && <span className="text-accent font-semibold">Inga ursäkter.</span>}
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
        </>
    );

    // Check if we're on the registration step
    const isRegistrationStep = selectedLevel && (
        (selectedLevel === 'easy' && step === 7) ||
        (selectedLevel !== 'easy' && step === 8)
    );

    return (
        <MobileContainer>
            <div className="min-h-screen bg-background flex flex-col p-6">
                {/* Header */}
                <div className="mb-8">
                    <Logo />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                    {renderStep()}
                </div>

                {/* Navigation */}
                {step > 0 && !isRegistrationStep && (
                    <div className="space-y-6 pt-8">
                        {/* Progress Dots */}
                        <ProgressDots total={TOTAL_STEPS} current={step} />

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 px-6 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-primary transition-all"
                            >
                                ← TILLBAKA
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 px-6 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                            >
                                NÄSTA →
                            </button>
                        </div>
                    </div>
                )}

                {/* Back button on registration step */}
                {isRegistrationStep && (
                    <div className="pt-4">
                        <button
                            onClick={handleBack}
                            className="w-full px-6 py-3 text-primary/60 font-inter text-sm uppercase tracking-wider hover:text-accent transition-all"
                        >
                            ← TILLBAKA
                        </button>
                    </div>
                )}
            </div>
        </MobileContainer>
    );
}

