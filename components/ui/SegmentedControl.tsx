/**
 * SegmentedControl Component
 * Select between 0-2 for morning check-in scores
 */

'use client';

import type { ScoreUI } from '@/types/logic.types';

interface SegmentedControlProps {
    value: ScoreUI;
    onChange: (value: ScoreUI) => void;
    labels?: [string, string, string];
    name?: string;
}

export default function SegmentedControl({
    value,
    onChange,
    labels = ['Dåligt', 'Okej', 'Bra'],
    name,
}: SegmentedControlProps) {
    const options: ScoreUI[] = [0, 1, 2];

    return (
        <div className="flex gap-2 w-full">
            {options.map((option, index) => {
                const isSelected = value === option;

                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`
              flex-1 px-4 py-3 font-inter font-semibold text-sm uppercase tracking-wider
              border-2 transition-all duration-200
              ${isSelected
                                ? 'bg-accent text-background border-accent'
                                : 'bg-surface text-primary border-primary/20 hover:border-accent/50'
                            }
            `}
                        aria-label={`${name ? name + ': ' : ''}${labels[index]}`}
                        aria-pressed={isSelected}
                    >
                        {labels[index]}
                    </button>
                );
            })}
        </div>
    );
}
