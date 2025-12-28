'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quote } from '@/lib/data/quotes';

interface DayCompleteOverlayProps {
    quote: Quote;
    isPremium: boolean;
    onClose: () => void;
    onShowPremiumPaywall: () => void;
}

export default function DayCompleteOverlay({
    quote,
    isPremium,
    onClose,
    onShowPremiumPaywall,
}: DayCompleteOverlayProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger fade-in animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface via-background to-background opacity-80" />

            {/* Content */}
            <div className="relative z-10 px-8 max-w-lg text-center space-y-12">

                {/* Header (Optional, or just clean) */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-6xl animate-pulse">🏛️</span>
                    <h2 className="font-teko text-3xl uppercase tracking-widest text-primary/60">
                        DAG AVKLARAD
                    </h2>
                </div>

                {/* Quote */}
                <div className="space-y-6">
                    <p className="font-teko text-4xl md:text-5xl leading-tight text-primary">
                        "{quote.text}"
                    </p>
                    <p className="font-inter text-sm uppercase tracking-widest text-accent">
                        — {quote.author}
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-8">
                    {/* Squad Link */}
                    {isPremium ? (
                        <Link
                            href="/squad"
                            className="block w-full py-4 bg-surface border-2 border-primary/20 hover:border-accent hover:text-accent transition-all text-center rounded-lg group"
                        >
                            <span className="font-inter font-bold text-lg uppercase tracking-wider">
                                ⚔️ GÅ TILL PLUTONEN
                            </span>
                            <span className="block text-xs font-normal text-primary/60 mt-1 group-hover:text-accent/80">
                                Dela din seger
                            </span>
                        </Link>
                    ) : (
                        <button
                            onClick={onShowPremiumPaywall}
                            className="w-full py-4 bg-surface text-primary/60 border-2 border-primary/20 hover:border-accent transition-all text-center rounded-lg"
                        >
                            <span className="font-inter font-bold text-lg uppercase tracking-wider">
                                🔒 GÅ TILL PLUTONEN
                            </span>
                        </button>
                    )}

                    {/* Return Link (Back Arrow) */}
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 mx-auto text-primary/40 hover:text-primary transition-colors text-xs uppercase tracking-widest py-4"
                    >
                        ← GRANSKA DAGEN
                    </button>
                </div>
            </div>
        </div>
    );
}
