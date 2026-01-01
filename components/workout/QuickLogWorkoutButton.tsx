'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { logQuickWorkout } from '@/lib/actions/workout';
import { useRouter } from 'next/navigation';

export default function QuickLogWorkoutButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Form inputs
    const [name, setName] = useState('');
    const [type, setType] = useState<'indoor' | 'outdoor'>('indoor');

    const handleOpen = () => {
        setName('');
        setType('indoor');
        setIsOpen(true);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setLoading(true);
        try {
            const result = await logQuickWorkout(name, type);
            if (result.error) {
                alert('Kunde inte spara passet: ' + result.error);
            } else {
                setIsOpen(false);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('Ett fel uppstod.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={handleOpen}
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
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="LOGGA PASS"
            >
                <div className="space-y-6">
                    {/* What did you do? */}
                    <div className="space-y-2">
                        <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                            VAD GJORDE DU?
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="T.ex. Promenad, Löpning, Padel..."
                            className="w-full bg-background border border-primary/20 p-3 text-primary font-inter focus:border-accent focus:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Indoor / Outdoor */}
                    <div className="space-y-2">
                        <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                            TYP AV PASS
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setType('indoor')}
                                className={`p-4 border-2 font-inter font-bold text-sm uppercase tracking-wider transition-all ${type === 'indoor'
                                    ? 'border-accent bg-accent text-background'
                                    : 'border-primary/20 bg-transparent text-primary/60 hover:text-primary hover:border-primary/40'
                                    }`}
                            >
                                INOMHUS
                            </button>
                            <button
                                onClick={() => setType('outdoor')}
                                className={`p-4 border-2 font-inter font-bold text-sm uppercase tracking-wider transition-all ${type === 'outdoor'
                                    ? 'border-accent bg-accent text-background'
                                    : 'border-primary/20 bg-transparent text-primary/60 hover:text-primary hover:border-primary/40'
                                    }`}
                            >
                                UTOMHUS
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className="w-full py-4 bg-accent text-background font-inter font-bold text-sm uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'SPARAR...' : 'SPARA PASS'}
                    </button>
                </div>
            </Modal>
        </>
    );
}
