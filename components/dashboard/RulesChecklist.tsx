/**
 * Rules Checklist Component
 * Tracks completion of the 5 mandatory rules
 */

'use client';

import { useState } from 'react';

import type { DailyLog } from '@/types/database.types';
import type { RuleName } from '@/types/logic.types';

interface RulesChecklistProps {
    log: DailyLog | null;
    onToggleRule: (rule: RuleName, value: boolean) => Promise<void>;
    onUpdateWater: (liters: number) => Promise<void>;
    onShowDietInfo?: () => void;
    selectedDietName?: string | null;
    onPhotoClick?: () => void;
    onViewPhoto?: () => void;
    isPremium?: boolean;
    onShowPremiumPaywall?: () => void;
}

export default function RulesChecklist({
    log,
    onToggleRule,
    onUpdateWater,
    onShowDietInfo,
    selectedDietName,
    onPhotoClick,
    onViewPhoto,
    isPremium = false,
    onShowPremiumPaywall,
}: RulesChecklistProps) {
    const [updatingRule, setUpdatingRule] = useState<RuleName | null>(null);

    const handleToggle = async (rule: RuleName, value: boolean) => {
        setUpdatingRule(rule);
        try {
            await onToggleRule(rule, value);
        } finally {
            setUpdatingRule(null);
        }
    };

    const handlePhotoToggle = () => {
        if (log?.progress_photo_url) {
            onViewPhoto?.();
        } else {
            onPhotoClick?.();
        }
    };

    const rules = [
        { key: 'diet_completed' as RuleName, icon: '🍽️', label: 'DIET', sub: 'Inga undantag', hasInfo: true, isPhoto: false },
        { key: 'workout_outdoor_completed' as RuleName, icon: '🏃', label: 'UTOMHUS', sub: '45 min · Friska luften', hasInfo: false, isPhoto: false },
        { key: 'workout_indoor_completed' as RuleName, icon: '🏋️', label: 'INOMHUS', sub: '45 min · Bygg pannben', hasInfo: false, isPhoto: false },
        { key: 'reading_completed' as RuleName, icon: '📖', label: 'LÄSNING', sub: '10 sidor · Ingen fiction', hasInfo: false, isPhoto: false },
        { key: 'photo_uploaded' as RuleName, icon: '📸', label: 'FOTO', sub: 'Dokumentera sanningen', hasInfo: false, isPhoto: true },
    ];

    return (
        <div className="space-y-4">
            {/* Rules Cards */}
            <div className="grid gap-3">
                {rules.map((rule) => {
                    const isCompleted = rule.isPhoto ? !!log?.progress_photo_url : log?.[rule.key] === true;
                    const isUpdating = updatingRule === rule.key;

                    return (
                        <div
                            key={rule.key}
                            onClick={() => !isUpdating && (rule.isPhoto ? handlePhotoToggle() : handleToggle(rule.key, !isCompleted))}
                            className={`
                                relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group select-none
                                ${isCompleted
                                    ? 'bg-status-green/10 border-status-green/50'
                                    : 'bg-surface border-white/5 hover:border-white/10'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl filter drop-shadow-lg">{rule.icon}</span>
                                    <div>
                                        <h3 className={`font-teko text-xl uppercase tracking-wider leading-none ${isCompleted ? 'text-status-green' : 'text-primary'}`}>
                                            {rule.label}
                                        </h3>
                                        <p className="font-inter text-xs text-primary/50 font-medium">
                                            {rule.sub}
                                        </p>
                                    </div>
                                </div>

                                <div className={`
                                    w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all bg-background
                                    ${isCompleted
                                        ? 'border-status-green bg-status-green text-black'
                                        : 'border-primary/20 text-transparent'
                                    }
                                `}>
                                    {isUpdating ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Diet Info Button (Integrated) */}
                            {rule.hasInfo && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        isPremium ? onShowDietInfo?.() : onShowPremiumPaywall?.();
                                    }}
                                    className="absolute bottom-2 right-14 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface/50 text-primary/40 hover:text-accent hover:bg-surface border border-transparent hover:border-accent/20 transition-all"
                                >
                                    {selectedDietName || 'VÄLJ DIET'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Water Tracker (Visual) */}
            <div className="bg-surface border-2 border-primary/20 rounded-xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💧</span>
                        <div>
                            <h3 className="font-teko text-xl uppercase tracking-wider text-primary leading-none">VATTEN</h3>
                            <p className="font-inter text-xs text-primary/50">3.5 Liter per dag</p>
                        </div>
                    </div>
                    <div className="font-teko text-2xl text-accent">
                        {(log?.water_intake || 0).toFixed(1)}L
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-background rounded-full overflow-hidden mb-4 border border-white/5 relative z-10">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(((log?.water_intake || 0) / 3.5) * 100, 100)}%` }}
                    />
                </div>

                {/* Controls */}
                <div className="flex gap-2 relative z-10">
                    <button
                        onClick={() => onUpdateWater(Math.max((log?.water_intake || 0) - 0.5, 0))}
                        className="flex-1 py-3 bg-background border border-primary/10 rounded-lg text-primary/60 hover:text-primary hover:border-primary/30 transition-all font-teko text-xl"
                    >
                        - 0.5L
                    </button>
                    <button
                        onClick={() => onUpdateWater((log?.water_intake || 0) + 0.5)}
                        className="flex-1 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all font-teko text-xl"
                    >
                        + 0.5L
                    </button>
                </div>
            </div>
        </div>
    );
}
