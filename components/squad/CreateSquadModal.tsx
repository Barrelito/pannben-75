/**
 * Create Squad Modal
 */

'use client';

import { useState } from 'react';
import MobileContainer from '@/components/layout/MobileContainer';

interface CreateSquadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
}

export default function CreateSquadModal({ isOpen, onClose, onSubmit }: CreateSquadModalProps) {
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(name);
            setName('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <div className="bg-surface border-2 border-accent w-full max-w-sm p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-primary/60 hover:text-accent"
                >
                    ✕
                </button>

                <h2 className="font-teko text-3xl uppercase tracking-wider text-accent mb-6">
                    Skapa Pluton
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-inter text-primary/60 uppercase tracking-wider mb-2">
                            Plutonens Namn
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="T.ex. Alpha Team"
                            maxLength={20}
                            className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim() || submitting}
                        className="w-full py-4 bg-accent text-background font-inter font-bold text-sm uppercase tracking-wider hover:bg-transparent hover:text-accent border-2 border-accent transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Skapar...' : 'BEKRÄFTA'}
                    </button>
                </form>
            </div>
        </div>
    );
}
