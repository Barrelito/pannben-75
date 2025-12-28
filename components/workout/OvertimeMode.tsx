/**
 * Overtime Mode Component
 * Displayed when workout is done but 45 minutes not reached
 */

'use client';

interface OvertimeModeProps {
    remainingSeconds: number;
    remainingFormatted: string;
    canComplete: boolean;
    onComplete: () => void;
}

export default function OvertimeMode({
    remainingSeconds,
    remainingFormatted,
    canComplete,
    onComplete,
}: OvertimeModeProps) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            {/* Header */}
            <div className="mb-8">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="font-teko text-4xl uppercase tracking-wider text-status-green">
                    BONUS TIME
                </h1>
            </div>

            {/* Countdown */}
            <div className="mb-8">
                <div className="font-teko text-8xl text-accent mb-2">
                    {remainingFormatted}
                </div>
                <div className="font-inter text-lg text-primary/80 uppercase tracking-wider">
                    KVAR TILL 45:00
                </div>
            </div>

            {/* Suggestions */}
            <div className="bg-surface border-2 border-primary/20 p-6 mb-8 max-w-md">
                <h2 className="font-inter text-sm uppercase tracking-wider text-primary/60 mb-4">
                    FORTSÄTT MED:
                </h2>
                <ul className="space-y-2 text-left font-inter text-primary">
                    <li>• Stretching / Mobility</li>
                    <li>• Lätt promenad</li>
                    <li>• Andningsövningar</li>
                    <li>• Foam rolling</li>
                </ul>
            </div>

            {/* Complete Button */}
            <button
                onClick={onComplete}
                disabled={!canComplete}
                className={`px-12 py-6 font-teko text-2xl uppercase tracking-wider border-2 transition-all ${canComplete
                        ? 'bg-status-green text-background border-status-green hover:bg-transparent hover:text-status-green'
                        : 'bg-surface text-primary/30 border-primary/20 cursor-not-allowed'
                    }`}
            >
                {canComplete ? '✓ AVSLUTA PASS' : 'VÄNTA...'}
            </button>

            {!canComplete && (
                <p className="mt-4 font-inter text-sm text-primary/60">
                    Passet måste vara minst 45 minuter
                </p>
            )}
        </div>
    );
}
