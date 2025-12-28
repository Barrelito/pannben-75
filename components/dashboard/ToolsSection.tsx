/**
 * Tools Section Component
 * Grid of utility tools (BMR Calculator, Photo Gallery)
 */

'use client';

import { useState } from 'react';
import BMRCalculatorModal from './BMRCalculatorModal';

interface ToolsSectionProps {
    onOpenGallery: () => void;
}

export default function ToolsSection({ onOpenGallery }: ToolsSectionProps) {
    const [showBMR, setShowBMR] = useState(false);

    return (
        <>
            <div className="bg-surface border-2 border-primary/20 p-6">
                <h2 className="font-teko text-2xl uppercase tracking-wider text-primary border-b-2 border-primary/20 pb-2 mb-4">
                    VERKTYG
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowBMR(true)}
                        className="px-6 py-4 bg-surface text-primary font-inter font-semibold text-xs uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all text-center"
                    >
                        🔥<br />BMR<br />KALKYLATOR
                    </button>

                    <button
                        onClick={onOpenGallery}
                        className="px-6 py-4 bg-surface text-primary font-inter font-semibold text-xs uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all text-center"
                    >
                        📸<br />MITT<br />GALLERI
                    </button>
                </div>
            </div>

            {showBMR && <BMRCalculatorModal onClose={() => setShowBMR(false)} />}
        </>
    );
}
