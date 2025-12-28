/**
 * Dashboard Client Component
 * Contains all the interactive UI and state management
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';
import MorningCheckin from '@/components/dashboard/MorningCheckin';

import RulesChecklist from '@/components/dashboard/RulesChecklist';
import BMRCalculator from '@/components/dashboard/BMRCalculator';
import NightWatch from '@/components/dashboard/NightWatch';
import DayCompleteOverlay from '@/components/dashboard/DayCompleteOverlay';
import SettingsModal from '@/components/dashboard/SettingsModal';
import DietModal from '@/components/dashboard/DietModal';
import ToolsSection from '@/components/dashboard/ToolsSection';
import PhotoUpload from '@/components/dashboard/PhotoUpload';
import PhotoGallery from '@/components/dashboard/PhotoGallery';
import PremiumPaywall from '@/components/premium/PremiumPaywall';
import { useDailyLog } from '@/hooks/useDailyLog';
import { usePremium } from '@/hooks/usePremium';
import { useDiet } from '@/hooks/useDiet';
import { useSquadNotifications } from '@/hooks/useSquadNotifications';
import { getRandomQuote } from '@/lib/data/quotes';
import { calculateRecoveryStatus } from '@/lib/logic/recovery';
import { dbToUi } from '@/lib/utils/scales';
import { getDayNumber } from '@/lib/utils/dates';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database.types';
import type { MorningScoresUI } from '@/types/logic.types';

interface DashboardClientProps {
    user: User;
    profile: Profile | null;
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
    const router = useRouter();
    const {
        log,
        loading,
        gracePeriod,
        submitMorningCheckin,
        toggleRule,
        updateWaterIntake,
        updatePlanning,
        completeDay,
    } = useDailyLog(user.id);

    const { isPremium, redeemVipCode, refreshStatus } = usePremium(user.id);
    const { availableDiets, selectedDiet, selectDiet } = useDiet(user.id);
    const { hasNotifications, count: notificationCount } = useSquadNotifications(user.id);

    const [showMorningCheckin, setShowMorningCheckin] = useState(false);
    const [showNightWatch, setShowNightWatch] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showPremiumSuccess, setShowPremiumSuccess] = useState(false);
    const [showDietModal, setShowDietModal] = useState(false);
    const [showPhotoUpload, setShowPhotoUpload] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [showPremiumPaywall, setShowPremiumPaywall] = useState(false);
    const [showDayComplete, setShowDayComplete] = useState(false);
    const [dailyQuote, setDailyQuote] = useState(getRandomQuote());

    // Check for premium success redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('premium') === 'success') {
            setShowPremiumSuccess(true);
            // Clean URL
            window.history.replaceState({}, '', '/dashboard');
            // Refresh premium status
            refreshStatus();
        }
    }, [refreshStatus]);

    // Determine if morning check-in is needed
    useEffect(() => {
        if (!loading && gracePeriod) {
            // Check-in needed if:
            // 1. Log exists but has no sleep score (partial log)
            // 2. No log exists at all for today (fresh start)
            const hasLog = log !== null;
            const needsCheckin = (!hasLog || !log.sleep_score) && gracePeriod.canLogToday;
            setShowMorningCheckin(needsCheckin);
        }
    }, [log, loading, gracePeriod]);

    // Check if day is completed on load
    useEffect(() => {
        if (log?.is_completed) {
            setShowDayComplete(true);
        }
    }, [log?.is_completed]);

    // Calculate current day
    // @ts-ignore - profile type from server
    const currentDay = profile?.start_date
        ? getDayNumber(profile.start_date as string)
        : 0;

    // Calculate recovery status from log
    const recoveryData = log?.sleep_score
        ? calculateRecoveryStatus({
            sleep: dbToUi(log.sleep_score),
            body: dbToUi(log.body_score || 5),
            energy: dbToUi(log.energy_score || 5),
            stress: dbToUi(log.stress_score || 5),
            motivation: dbToUi(log.motivation_score || 5),
        })
        : null;

    // Check if all 5 rules are complete
    const allRulesComplete =
        log?.diet_completed &&
        log?.workout_outdoor_completed &&
        log?.workout_indoor_completed &&
        log?.reading_completed &&
        log?.photo_uploaded;

    const handleMorningCheckin = async (scores: MorningScoresUI) => {
        await submitMorningCheckin(scores);
        router.refresh();
    };

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background pb-20">
                {/* Modals */}
                <MorningCheckin
                    isOpen={showMorningCheckin}
                    onClose={() => setShowMorningCheckin(false)}
                    onSubmit={handleMorningCheckin}
                />

                <NightWatch
                    isOpen={showNightWatch}
                    onClose={() => setShowNightWatch(false)}
                    onSubmit={updatePlanning}
                    isPremium={isPremium}
                    initialData={{
                        plan_workout_1: log?.plan_workout_1,
                        plan_workout_1_time: log?.plan_workout_1_time,
                        plan_workout_2: log?.plan_workout_2,
                        plan_workout_2_time: log?.plan_workout_2_time,
                        plan_diet: log?.plan_diet,
                    }}
                />

                {showDayComplete && (
                    <DayCompleteOverlay
                        quote={dailyQuote}
                        isPremium={isPremium}
                        onClose={() => setShowDayComplete(false)}
                        onShowPremiumPaywall={() => setShowPremiumPaywall(true)}
                    />
                )}

                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    userId={user.id}
                    currentDay={currentDay}
                    isPremium={isPremium}
                    onRedeemVip={async (code) => {
                        const result = await redeemVipCode(code);
                        if (result.success) {
                            await refreshStatus();
                        }
                        return result;
                    }}
                />

                {/* Premium Success Toast */}
                {showPremiumSuccess && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                        <div className="bg-surface border-2 border-accent p-8 max-w-sm text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="font-teko text-3xl uppercase tracking-wider text-accent mb-2">
                                TACK FÖR KÖPET!
                            </h2>
                            <p className="font-inter text-primary/80 mb-6">
                                Premium är nu aktiverat. Njut av alla funktioner!
                            </p>
                            <button
                                onClick={() => setShowPremiumSuccess(false)}
                                className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                            >
                                STÄNG
                            </button>
                        </div>
                    </div>
                )}

                {/* Diet Modal */}
                <DietModal
                    isOpen={showDietModal}
                    onClose={() => setShowDietModal(false)}
                    availableDiets={availableDiets}
                    selectedDiet={selectedDiet}
                    onSelectDiet={selectDiet}
                />

                {/* Photo Upload */}
                {showPhotoUpload && (
                    <PhotoUpload
                        userId={user.id}
                        currentPhotoUrl={log?.progress_photo_url || null}
                        onPhotoUploaded={async (url) => {
                            try {
                                console.log('Saving photo URL:', url);
                                const supabase = createClient();
                                const today = new Date().toISOString().split('T')[0];

                                // Upsert to ensure row exists
                                const { data, error } = await supabase
                                    .from('daily_logs')
                                    .upsert({
                                        user_id: user.id,
                                        log_date: today,
                                        progress_photo_url: url,
                                        photo_uploaded: true,
                                    }, {
                                        onConflict: 'user_id,log_date'
                                    })
                                    .select();

                                if (error) {
                                    console.error('Error saving photo URL:', error);
                                    throw error;
                                }

                                console.log('Photo URL saved successfully:', data);

                                // Close modal and refresh
                                setShowPhotoUpload(false);
                                window.location.reload();
                            } catch (error) {
                                console.error('Failed to save photo:', error);
                                alert('Fotot uppladdades men kunde inte sparas. Försök igen.');
                                setShowPhotoUpload(false);
                            }
                        }}
                        onClose={() => setShowPhotoUpload(false)}
                    />
                )}

                {/* Photo Gallery */}
                {showGallery && <PhotoGallery userId={user.id} onClose={() => setShowGallery(false)} />}

                {/* Premium Paywall */}
                <PremiumPaywall
                    isOpen={showPremiumPaywall}
                    onClose={() => setShowPremiumPaywall(false)}
                    userId={user.id}
                    onRedeemVip={async (code) => {
                        const result = await redeemVipCode(code);
                        if (result.success) {
                            await refreshStatus();
                            setShowPremiumPaywall(false);
                        }
                        return result;
                    }}
                />


                <div className="relative">
                    {/* Status Background Gradient */}
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-b from-${recoveryData?.status === 'RED' ? 'status-red' : recoveryData?.status === 'YELLOW' ? 'status-yellow' : 'status-green'} to-background pointer-events-none`} />

                    {/* Header Content */}
                    <div className="relative z-10 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <Logo size="small" />
                            <div className="flex items-center gap-4">
                                {isPremium && (
                                    <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Premium</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-primary/10 text-primary/60 hover:text-accent hover:border-accent transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6 py-6">
                            {/* Profile & Status Hero */}
                            <div className="flex items-center gap-4">
                                {/* Profile Avatar */}
                                <div className="relative w-24 h-24 rounded-full border-2 border-primary/20 overflow-hidden shadow-2xl">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-surface flex items-center justify-center text-4xl">
                                            🫡
                                        </div>
                                    )}
                                    {/* Premium Badge */}
                                    {isPremium && (
                                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-accent rounded-full border-4 border-background flex items-center justify-center text-sm shadow-lg z-10">
                                            ✨
                                        </div>
                                    )}
                                </div>

                                {/* Recovery Status Badge */}
                                {recoveryData && (
                                    <div className={`flex flex-col p-4 rounded-xl border backdrop-blur-md shadow-xl transition-all ${recoveryData.status === 'RED' ? 'bg-status-red/10 border-status-red/30 text-status-red' :
                                        recoveryData.status === 'YELLOW' ? 'bg-status-yellow/10 border-status-yellow/30 text-status-yellow' :
                                            'bg-status-green/10 border-status-green/30 text-status-green'
                                        }`}>
                                        <span className="font-teko text-3xl uppercase tracking-wider leading-none mb-1 shadow-black drop-shadow-sm">
                                            {recoveryData.status === 'GREEN' ? 'REDO FÖR STRID' :
                                                recoveryData.status === 'YELLOW' ? 'ÅTERHÄMTNING' :
                                                    'VILA PÅKRÄVD'}
                                        </span>
                                        <span className="font-inter text-[10px] font-bold opacity-90 max-w-[160px] leading-tight uppercase tracking-wide">
                                            {recoveryData.message}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Day Counter */}
                            <div className="text-center">
                                <h1 className="font-teko text-8xl text-primary leading-none filter drop-shadow-2xl">
                                    <span className="text-accent">DAG {currentDay}</span><span className="text-primary/20">/75</span>
                                </h1>
                            </div>

                            {gracePeriod?.mustLogYesterday && (
                                <div className="inline-block px-4 py-2 bg-status-yellow/10 border border-status-yellow/30 rounded-lg">
                                    <span className="text-status-yellow text-xs font-bold uppercase tracking-wider">⚠️ {gracePeriod.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Wrapper */}
                <div className="p-6 space-y-6">

                    {/* Rules Checklist */}
                    <RulesChecklist
                        log={log}
                        onToggleRule={toggleRule}
                        onUpdateWater={updateWaterIntake}
                        onShowDietInfo={() => setShowDietModal(true)}
                        selectedDietName={selectedDiet?.name || null}
                        onPhotoClick={() => setShowPhotoUpload(true)}
                        onViewPhoto={() => {
                            if (log?.progress_photo_url) {
                                window.open(log.progress_photo_url, '_blank');
                            }
                        }}
                        isPremium={isPremium}
                        onShowPremiumPaywall={() => setShowPremiumPaywall(true)}
                    />

                    {/* Workout Link */}
                    {isPremium ? (
                        <Link
                            href="/workout"
                            className="block w-full px-8 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all text-center"
                        >
                            💪 STARTA TRÄNING
                        </Link>
                    ) : (
                        <button
                            onClick={() => setShowPremiumPaywall(true)}
                            className="w-full px-8 py-4 bg-surface text-primary/60 font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all text-center"
                        >
                            🔒 STARTA TRÄNING
                        </button>
                    )}

                    {/* Squad Link - Redesigned */}
                    {isPremium ? (
                        <Link
                            href="/squad"
                            onClick={() => localStorage.setItem('last_squad_visit', new Date().toISOString())}
                            className="relative block w-full py-8 bg-surface text-primary font-inter font-bold text-xl uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all text-center group"
                        >
                            <span className="flex items-center justify-center gap-3">
                                ⚔️ PLUTONEN
                                {hasNotifications && (
                                    <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-status-red text-xs text-white animate-pulse">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </span>
                            <span className="block text-xs font-normal text-primary/60 mt-1 group-hover:text-accent/80">
                                GEMENSKAP & PEPP
                            </span>
                        </Link>
                    ) : (
                        <button
                            onClick={() => setShowPremiumPaywall(true)}
                            className="w-full py-8 bg-surface text-primary/60 font-inter font-bold text-xl uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all text-center"
                        >
                            🔒 PLUTONEN
                        </button>
                    )}

                    {/* Night Watch Button */}
                    {/* Night Watch Button (Planning Status) */}
                    {allRulesComplete && (
                        <button
                            onClick={() => setShowNightWatch(true)}
                            className={`w-full px-8 py-4 font-inter font-semibold text-sm uppercase tracking-wider border-2 transition-all duration-300 ${(log?.plan_workout_1 || log?.plan_diet)
                                ? 'bg-status-green border-status-green text-black hover:bg-status-green/90'
                                : 'bg-accent text-background border-accent hover:bg-transparent hover:text-accent'
                                }`}
                        >
                            {(log?.plan_workout_1 || log?.plan_diet) ? '✅ PLANERING KLAR' : '🌙 PLANERA IMORGON'}
                        </button>
                    )}

                    {/* Finish Day Button (Lock Day) */}
                    {allRulesComplete && (log?.plan_workout_1 || log?.plan_diet) && (log.water_intake >= 3.5) && !log.is_completed && (
                        <button
                            onClick={() => {
                                if (confirm('Bra jobbat! En dag till handlingarna. Vill du låsa dagen?')) {
                                    completeDay();
                                    setDailyQuote(getRandomQuote());
                                    setShowDayComplete(true);
                                }
                            }}
                            className="w-full px-8 py-6 bg-gradient-to-r from-accent to-accent/80 text-background font-teko font-bold text-2xl uppercase tracking-widest border-2 border-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-accent/20 animate-pulse"
                        >
                            🔐 LÅS DAGEN & AVSLUTA
                        </button>
                    )}

                    {/* Day Locked State Indicator */}
                    {log?.is_completed && (
                        <div className="w-full px-8 py-6 bg-surface/30 border border-primary/10 rounded-lg text-center animate-in fade-in duration-500">
                            <h3 className="font-teko text-2xl uppercase tracking-widest text-primary/40 mb-2">
                                🔐 DAGEN ÄR LÅST
                            </h3>
                            <button
                                onClick={() => setShowDayComplete(true)}
                                className="text-xs font-inter text-accent uppercase tracking-wider hover:text-accent/80 transition-colors"
                            >
                                VISA VISDOMSORD IGEN
                            </button>
                        </div>
                    )}

                    {/* Tools Section */}
                    <ToolsSection onOpenGallery={() => setShowGallery(true)} />
                </div>
            </main>
        </MobileContainer >
    );
}
