/**
 * Add to Homescreen Component
 * Detects OS and shows relevant installation instructions
 */

'use client';

import { useState, useEffect } from 'react';

type Platform = 'ios' | 'android' | 'other';

function detectPlatform(): Platform {
    if (typeof window === 'undefined') return 'other';

    const userAgent = window.navigator.userAgent.toLowerCase();

    // iOS detection
    if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
    }

    // Android detection  
    if (/android/.test(userAgent)) {
        return 'android';
    }

    return 'other';
}

interface AddToHomescreenProps {
    onClose: () => void;
}

export default function AddToHomescreen({ onClose }: AddToHomescreenProps) {
    const [platform, setPlatform] = useState<Platform>('other');

    useEffect(() => {
        setPlatform(detectPlatform());
    }, []);

    const renderIOSInstructions = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-surface border-2 border-primary/20">
                <span className="text-3xl">1</span>
                <div>
                    <p className="font-inter text-primary">
                        Tryck på <span className="text-accent font-semibold">Dela-knappen</span>
                    </p>
                    <p className="text-sm text-primary/60">
                        (Rutan med pil uppåt längst ner i Safari)
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface border-2 border-primary/20">
                <span className="text-3xl">2</span>
                <div>
                    <p className="font-inter text-primary">
                        Scrolla och välj <span className="text-accent font-semibold">"Lägg till på hemskärmen"</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface border-2 border-primary/20">
                <span className="text-3xl">3</span>
                <div>
                    <p className="font-inter text-primary">
                        Tryck <span className="text-accent font-semibold">"Lägg till"</span> uppe till höger
                    </p>
                </div>
            </div>

            <div className="text-center text-sm text-primary/60 mt-4">
                <p>📱 Appen visas nu på din hemskärm!</p>
            </div>
        </div>
    );

    const renderAndroidInstructions = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-surface border-2 border-primary/20">
                <span className="text-3xl">1</span>
                <div>
                    <p className="font-inter text-primary">
                        Tryck på <span className="text-accent font-semibold">⋮ menyn</span>
                    </p>
                    <p className="text-sm text-primary/60">
                        (Tre prickar uppe till höger i Chrome)
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface border-2 border-primary/20">
                <span className="text-3xl">2</span>
                <div>
                    <p className="font-inter text-primary">
                        Välj <span className="text-accent font-semibold">"Lägg till på startskärmen"</span>
                    </p>
                    <p className="text-sm text-primary/60">
                        eller "Installera app"
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface border-2 border-primary/20">
                <span className="text-3xl">3</span>
                <div>
                    <p className="font-inter text-primary">
                        Bekräfta med <span className="text-accent font-semibold">"Lägg till"</span>
                    </p>
                </div>
            </div>

            <div className="text-center text-sm text-primary/60 mt-4">
                <p>📱 Appen visas nu på din startskärm!</p>
            </div>
        </div>
    );

    const renderOtherInstructions = () => (
        <div className="space-y-6">
            {/* iOS Section */}
            <div>
                <h3 className="font-teko text-xl uppercase tracking-wider text-accent mb-3">
                    📱 iPHONE / iPAD
                </h3>
                <div className="space-y-2 text-sm">
                    <p className="text-primary/80">1. Öppna i Safari</p>
                    <p className="text-primary/80">2. Tryck på Dela-knappen</p>
                    <p className="text-primary/80">3. Välj "Lägg till på hemskärmen"</p>
                </div>
            </div>

            {/* Android Section */}
            <div>
                <h3 className="font-teko text-xl uppercase tracking-wider text-accent mb-3">
                    🤖 ANDROID
                </h3>
                <div className="space-y-2 text-sm">
                    <p className="text-primary/80">1. Öppna i Chrome</p>
                    <p className="text-primary/80">2. Tryck på ⋮ menyn</p>
                    <p className="text-primary/80">3. Välj "Lägg till på startskärmen"</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-background border-2 border-accent w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b-2 border-primary/20">
                    <div className="text-center">
                        <div className="text-5xl mb-3">📲</div>
                        <h2 className="font-teko text-3xl uppercase tracking-wider text-accent">
                            SPARA APPEN
                        </h2>
                        <p className="font-inter text-sm text-primary/80 mt-2">
                            Lägg till på hemskärmen för snabb åtkomst
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {platform === 'ios' && renderIOSInstructions()}
                    {platform === 'android' && renderAndroidInstructions()}
                    {platform === 'other' && renderOtherInstructions()}
                </div>

                {/* Close Button */}
                <div className="p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                    >
                        FÖRSTÅTT!
                    </button>
                </div>
            </div>
        </div>
    );
}
