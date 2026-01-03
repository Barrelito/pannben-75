/**
 * StreakBrokenDialog Component
 * Shown when user missed more than 1 day - streak is broken, must reset
 */

'use client';

interface StreakBrokenDialogProps {
    isOpen: boolean;
    daysMissed: number;
    onReset: () => void;
}

export default function StreakBrokenDialog({ isOpen, daysMissed, onReset }: StreakBrokenDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6">
            <div className="bg-surface border-2 border-status-red p-8 max-w-sm w-full text-center">
                {/* Icon */}
                <div className="text-6xl mb-4">💔</div>

                {/* Title */}
                <h2 className="font-teko text-4xl uppercase tracking-wider text-status-red mb-4">
                    Kedjan är bruten
                </h2>

                {/* Message */}
                <p className="font-inter text-lg text-primary mb-2">
                    Du har missat <span className="text-status-red font-bold">{daysMissed}</span> dagar.
                </p>
                <p className="font-inter text-sm text-primary/60 mb-8">
                    Enligt reglerna måste utmaningen startas om från dag 1.
                </p>

                {/* Quote */}
                <div className="bg-background/50 border border-primary/10 p-4 mb-8">
                    <p className="font-inter text-sm text-primary/80 italic">
                        &quot;Att misslyckas är inte slutet. Att ge upp är.&quot;
                    </p>
                </div>

                {/* Reset Button */}
                <button
                    onClick={onReset}
                    className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                >
                    STARTA OM UTMANINGEN
                </button>

                {/* Encouragement */}
                <p className="font-inter text-xs text-primary/40 mt-6">
                    Varje dag är en ny chans att bli bättre 💪
                </p>
            </div>
        </div>
    );
}
