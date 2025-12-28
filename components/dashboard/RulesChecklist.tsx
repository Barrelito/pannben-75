/**
 * Rules Checklist Component
 * Tracks completion of the 5 mandatory rules
 */

'use client';

import { useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import WaterCounter from '@/components/dashboard/WaterCounter';
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
}

export default function RulesChecklist({
    log,
    onToggleRule,
    onUpdateWater,
    onShowDietInfo,
    selectedDietName,
    onPhotoClick,
    onViewPhoto,
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
        // If photo exists, view it; otherwise open upload
        if (log?.progress_photo_url) {
            onViewPhoto?.();
        } else {
            onPhotoClick?.();
        }
    };

    const rules = [
        { key: 'diet_completed' as RuleName, label: 'DIET', hasInfo: true, isPhoto: false },
        { key: 'workout_outdoor_completed' as RuleName, label: 'TRÄNING UTOMHUS', hasInfo: false, isPhoto: false },
        { key: 'workout_indoor_completed' as RuleName, label: 'TRÄNING INOMHUS', hasInfo: false, isPhoto: false },
        { key: 'reading_completed' as RuleName, label: 'LÄSNING (10 SIDOR)', hasInfo: false, isPhoto: false },
        { key: 'photo_uploaded' as RuleName, label: 'PROGRESS FOTO 📷', hasInfo: false, isPhoto: true },
    ];

    // Count completed rules
    const completedCount = rules.filter((rule) => log?.[rule.key] === true).length;

    return (
        <div className="bg-surface border-2 border-primary/20 p-6 space-y-6">
            {/* Header */}
            <h2 className="font-teko text-2xl uppercase tracking-wider text-primary border-b-2 border-primary/20 pb-2">
                DE 5 REGLERNA
            </h2>

            {/* Rules */}
            <div className="space-y-4">
                {rules.map((rule) => (
                    <div key={rule.key} className="flex items-center justify-between">
                        <Checkbox
                            checked={rule.isPhoto ? !!log?.progress_photo_url : log?.[rule.key] === true}
                            onChange={(value) => rule.isPhoto ? handlePhotoToggle() : handleToggle(rule.key, value)}
                            label={rule.label}
                            disabled={updatingRule === rule.key}
                        />

                        {/* Diet Selection/Info */}
                        {rule.hasInfo && onShowDietInfo && (
                            <div className="flex items-center gap-2">
                                {selectedDietName ? (
                                    <button
                                        onClick={onShowDietInfo}
                                        className="flex items-center gap-2 px-3 py-1 bg-surface border border-primary/20 hover:border-accent transition-colors rounded-sm"
                                    >
                                        <span className="font-inter text-xs text-primary/80">
                                            {selectedDietName.toUpperCase()}
                                        </span>
                                        <span className="text-primary/60">ℹ️</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={onShowDietInfo}
                                        className="px-3 py-1 bg-accent text-background font-inter font-semibold text-xs uppercase tracking-wider hover:bg-accent/80 transition-colors rounded-sm"
                                    >
                                        VÄLJ DIET
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Water Intake */}
            <div className="pt-4 border-t-2 border-primary/20">
                <label className="block font-inter text-xs uppercase tracking-wider text-primary/60 mb-3">
                    VATTEN
                </label>
                <WaterCounter
                    liters={log?.water_intake ? Number(log.water_intake) : 0}
                    onChange={onUpdateWater}
                />
            </div>

            {/* Progress */}
            <div className="pt-4 border-t-2 border-primary/20">
                <div className="font-teko text-xl text-center text-accent uppercase tracking-wider">
                    {completedCount}/5 REGLER KLARA
                </div>
            </div>
        </div>
    );
}
