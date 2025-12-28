/**
 * Morning Check-in Modal
 * First thing user sees to record their morning health metrics
 */

'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import SegmentedControl from '@/components/ui/SegmentedControl';
import type { MorningScoresUI } from '@/types/logic.types';

interface MorningCheckinProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (scores: MorningScoresUI) => Promise<void>;
}

export default function MorningCheckin({
    isOpen,
    onClose,
    onSubmit,
}: MorningCheckinProps) {
    const [scores, setScores] = useState<MorningScoresUI>({
        sleep: 1,
        body: 1,
        energy: 1,
        stress: 1,
        motivation: 1,
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit(scores);
            onClose();
        } catch (error) {
            console.error('Error submitting check-in:', error);
            alert('Kunde inte spara. Försök igen.');
        } finally {
            setLoading(false);
        }
    };

    const metrics: Array<{
        key: keyof MorningScoresUI;
        label: string;
    }> = [
            { key: 'sleep', label: 'SÖMN' },
            { key: 'body', label: 'KROPP' },
            { key: 'energy', label: 'ENERGI' },
            { key: 'stress', label: 'STRESS' },
            { key: 'motivation', label: 'MOTIVATION' },
        ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="MORGON CHECK-IN">
            <div className="space-y-6">
                {/* Metrics */}
                {metrics.map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                        <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                            {label}
                        </label>
                        <SegmentedControl
                            value={scores[key]}
                            onChange={(value) => setScores({ ...scores, [key]: value })}
                            name={label}
                        />
                    </div>
                ))}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                >
                    {loading ? 'SPARAR...' : 'SKICKA'}
                </button>
            </div>
        </Modal>
    );
}
