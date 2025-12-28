/**
 * Water Counter Component
 * +/- controls for water intake tracking
 */

'use client';

interface WaterCounterProps {
    liters: number;
    onChange: (liters: number) => void;
    target?: number;
}

export default function WaterCounter({
    liters,
    onChange,
    target = 3.5,
}: WaterCounterProps) {
    const increment = 0.5;

    const handleDecrease = () => {
        if (liters > 0) {
            onChange(Math.max(0, liters - increment));
        }
    };

    const handleIncrease = () => {
        onChange(liters + increment);
    };

    const progress = Math.min((liters / target) * 100, 100);

    return (
        <div className="space-y-3">
            {/* Counter Controls */}
            <div className="flex items-center gap-4">
                {/* Decrease Button */}
                <button
                    onClick={handleDecrease}
                    disabled={liters === 0}
                    className="w-12 h-12 flex items-center justify-center bg-surface border-2 border-primary/20 hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Minska vatten"
                >
                    <span className="font-teko text-2xl">−</span>
                </button>

                {/* Display */}
                <div className="flex-1 text-center">
                    <div className="font-teko text-3xl text-accent">
                        {liters.toFixed(1)}L
                    </div>
                </div>

                {/* Increase Button */}
                <button
                    onClick={handleIncrease}
                    className="w-12 h-12 flex items-center justify-center bg-surface border-2 border-primary/20 hover:border-accent hover:text-accent transition-colors"
                    aria-label="Öka vatten"
                >
                    <span className="font-teko text-2xl">+</span>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
                <div className="h-2 bg-surface border border-primary/20 overflow-hidden">
                    <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="text-center font-inter text-xs text-primary/60 uppercase tracking-wider">
                    MÅL: {target}L
                </div>
            </div>
        </div>
    );
}
