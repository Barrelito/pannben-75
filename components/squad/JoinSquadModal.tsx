/**
 * Join Squad Modal
 */

'use client';

import { useState } from 'react';

interface JoinSquadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (code: string) => Promise<void>;
}

export default function JoinSquadModal({ isOpen, onClose, onSubmit }: JoinSquadModalProps) {
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(code.trim()); // Trim whitespace!
            setCode('');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setCode(text);
        } catch (err) {
            console.error('Failed to read clipboard');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <div className="bg-surface border-2 border-primary/20 w-full max-w-sm p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-primary/60 hover:text-accent"
                >
                    ✕
                </button>

                <h2 className="font-teko text-3xl uppercase tracking-wider text-primary mb-6">
                    Gå med i Pluton
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-inter text-primary/60 uppercase tracking-wider mb-2">
                            Inbjudningskod
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="XXXX-XX"
                                className="flex-1 px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter font-mono uppercase focus:border-accent focus:outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={handlePaste}
                                className="px-4 bg-surface border-2 border-primary/20 text-primary hover:border-accent hover:text-accent"
                            >
                                📋
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!code.trim() || submitting}
                        className="w-full py-4 bg-surface text-primary font-inter font-bold text-sm uppercase tracking-wider hover:bg-accent hover:text-background border-2 border-primary/20 hover:border-accent transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Går med...' : 'BEKRÄFTA'}
                    </button>
                </form>
            </div>
        </div>
    );
}
