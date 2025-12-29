/**
 * Level Selector Component
 * Full-screen selection for new users to choose their difficulty level
 */

'use client';

import { useState } from 'react';
import { LEVEL_INFO } from '@/lib/onboardingData';
import type { DifficultyLevel } from '@/lib/gameRules';

interface LevelSelectorProps {
    onSelect: (level: DifficultyLevel) => void;
}

export default function LevelSelector({ onSelect }: LevelSelectorProps) {
    const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null);

    const levels: DifficultyLevel[] = ['easy', 'medium', 'hard'];

    const getColorClasses = (color: string, isSelected: boolean) => {
        const colors: Record<string, { border: string; bg: string; text: string }> = {
            blue: {
                border: isSelected ? 'border-blue-500' : 'border-blue-500/30',
                bg: isSelected ? 'bg-blue-500/20' : 'bg-blue-500/5',
                text: 'text-blue-400',
            },
            yellow: {
                border: isSelected ? 'border-yellow-500' : 'border-yellow-500/30',
                bg: isSelected ? 'bg-yellow-500/20' : 'bg-yellow-500/5',
                text: 'text-yellow-400',
            },
            red: {
                border: isSelected ? 'border-red-500' : 'border-red-500/30',
                bg: isSelected ? 'bg-red-500/20' : 'bg-red-500/5',
                text: 'text-red-400',
            },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="text-5xl mb-4">⚔️</div>
                <h2 className="font-teko text-3xl uppercase tracking-wider text-accent mb-2">
                    VÄLJ DIN VÄG
                </h2>
                <p className="font-inter text-sm text-primary/70">
                    Vilken utmaning passar dig bäst?
                </p>
            </div>

            {/* Level Cards */}
            <div className="space-y-4">
                {levels.map((level) => {
                    const info = LEVEL_INFO[level];
                    const isSelected = selectedLevel === level;
                    const colors = getColorClasses(info.color, isSelected);

                    return (
                        <button
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={`
                                w-full p-5 rounded-xl border-2 transition-all duration-200 text-left
                                ${colors.border} ${colors.bg}
                                ${isSelected ? 'scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'}
                            `}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{info.emoji}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-teko text-2xl uppercase tracking-wider ${colors.text}`}>
                                            {info.name}
                                        </h3>
                                        <span className="font-inter text-xs text-primary/50">
                                            {info.subtitle}
                                        </span>
                                    </div>
                                    <p className="font-inter text-sm text-primary/70 mb-3">
                                        {info.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {info.highlights.map((highlight, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-background/50 rounded text-xs font-inter text-primary/60"
                                            >
                                                {highlight}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Selection indicator */}
                                <div className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                    ${isSelected
                                        ? `${colors.border} ${colors.bg}`
                                        : 'border-primary/20'
                                    }
                                `}>
                                    {isSelected && (
                                        <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Continue Button */}
            <button
                onClick={() => selectedLevel && onSelect(selectedLevel)}
                disabled={!selectedLevel}
                className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                {selectedLevel ? 'FORTSÄTT →' : 'VÄLJ EN NIVÅ'}
            </button>
        </div>
    );
}
