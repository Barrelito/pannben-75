/**
 * Onboarding Slide Component
 * Reusable component for onboarding steps
 */

'use client';

interface OnboardingSlideProps {
    icon: string;
    title: string;
    children: React.ReactNode;
}

export default function OnboardingSlide({ icon, title, children }: OnboardingSlideProps) {
    return (
        <div className="flex flex-col items-center text-center space-y-6">
            <div className="text-7xl">{icon}</div>
            <h2 className="font-teko text-4xl uppercase tracking-wider text-accent">
                {title}
            </h2>
            <div className="font-inter text-primary/80 leading-relaxed max-w-sm">
                {children}
            </div>
        </div>
    );
}
