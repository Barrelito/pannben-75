/**
 * MissedDayDialog Component
 * Shown when user missed exactly 1 day (yesterday)
 * "Var ärlig mot dig själv - Glömde du logga gårdagen?"
 */

'use client';

interface MissedDayDialogProps {
    isOpen: boolean;
    onYes: () => void;      // Allow backlog yesterday
    onNo: () => void;       // Trigger reset
}

export default function MissedDayDialog({ isOpen, onYes, onNo }: MissedDayDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <div className="bg-surface border-2 border-status-yellow p-8 max-w-sm w-full text-center">
                {/* Icon */}
                <div className="text-6xl mb-4">⚖️</div>

                {/* Title */}
                <h2 className="font-teko text-3xl uppercase tracking-wider text-status-yellow mb-4">
                    Var ärlig mot dig själv
                </h2>

                {/* Question */}
                <p className="font-inter text-lg text-primary mb-8">
                    Glömde du logga gårdagen?
                </p>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onYes}
                        className="flex-1 px-6 py-4 bg-status-green/20 text-status-green font-inter font-semibold text-sm uppercase tracking-wider border-2 border-status-green hover:bg-status-green hover:text-background transition-all"
                    >
                        JA
                    </button>
                    <button
                        onClick={onNo}
                        className="flex-1 px-6 py-4 bg-status-red/20 text-status-red font-inter font-semibold text-sm uppercase tracking-wider border-2 border-status-red hover:bg-status-red hover:text-background transition-all"
                    >
                        NEJ
                    </button>
                </div>

                {/* Explanation */}
                <p className="font-inter text-xs text-primary/50 mt-6">
                    Ja = Du får chansen att logga gårdagens uppgifter
                    <br />
                    Nej = Utmaningen startas om
                </p>
            </div>
        </div>
    );
}
