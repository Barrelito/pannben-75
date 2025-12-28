/**
 * Progress Dots Component
 * Shows current step in onboarding
 */

interface ProgressDotsProps {
    total: number;
    current: number;
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
    return (
        <div className="flex justify-center gap-2">
            {Array.from({ length: total }, (_, i) => (
                <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current
                            ? 'bg-accent w-6'
                            : i < current
                                ? 'bg-accent/60'
                                : 'bg-primary/20'
                        }`}
                />
            ))}
        </div>
    );
}
