'use client';

import { useState } from 'react';
import QuickLogModal from './QuickLogModal';

export default function QuickLogWorkoutButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-4 p-4 bg-surface border border-primary/20 hover:border-accent transition-colors text-left"
            >
                <span className="text-3xl">✏️</span>
                <div className="flex-1">
                    <h3 className="font-teko text-lg text-primary">LOGGA EGET PASS</h3>
                    <p className="font-inter text-xs text-primary/60">
                        Välj övningar fritt
                    </p>
                </div>
                <span className="text-primary/40">→</span>
            </button>

            {/* Modal */}
            <QuickLogModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}

