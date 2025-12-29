/**
 * Diet Selection Modal
 * Allows users to select a diet track and view its rules
 */

'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import type { DietTrack } from '@/types/database.types';

interface DietModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableDiets: DietTrack[];
    selectedDiet: DietTrack | null;
    onSelectDiet: (dietId: string) => Promise<void>;
    readOnly?: boolean; // When true, only shows rules without ability to change
}

export default function DietModal({
    isOpen,
    onClose,
    availableDiets,
    selectedDiet,
    onSelectDiet,
    readOnly = false,
}: DietModalProps) {
    const [loading, setLoading] = useState(false);
    const [showSelection, setShowSelection] = useState(!selectedDiet && !readOnly);

    const handleSelect = async (dietId: string) => {
        setLoading(true);
        try {
            await onSelectDiet(dietId);
            setShowSelection(false);
            onClose();
        } catch (error) {
            console.error('Error selecting diet:', error);
            alert('Kunde inte välja diet. Försök igen.');
        } finally {
            setLoading(false);
        }
    };

    const renderRules = (rules: any) => {
        if (!rules) return null;

        return (
            <div className="space-y-4">
                {/* Allowed Foods */}
                {rules.allowed && rules.allowed.length > 0 && (
                    <div>
                        <h3 className="font-inter text-xs uppercase tracking-wider text-status-green mb-2">
                            ✓ TILLÅTET
                        </h3>
                        <ul className="space-y-1">
                            {rules.allowed.map((item: string, idx: number) => (
                                <li key={idx} className="font-inter text-sm text-primary/80">
                                    • {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Foods to Avoid */}
                {rules.avoid && rules.avoid.length > 0 && (
                    <div>
                        <h3 className="font-inter text-xs uppercase tracking-wider text-status-red mb-2">
                            ✗ UNDVIK
                        </h3>
                        <ul className="space-y-1">
                            {rules.avoid.map((item: string, idx: number) => (
                                <li key={idx} className="font-inter text-sm text-primary/80">
                                    • {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="DIET">
            {/* Selection View - Only if not readOnly and no diet selected */}
            {!readOnly && showSelection ? (
                <div className="space-y-4">
                    <p className="font-inter text-sm text-primary/80">
                        Välj en diet att följa
                    </p>

                    {availableDiets.map((diet) => (
                        <div
                            key={diet.id}
                            className="bg-surface border-2 border-primary/20 p-4 hover:border-accent transition-colors"
                        >
                            <h3 className="font-teko text-2xl uppercase tracking-wider text-accent mb-2">
                                {diet.name}
                            </h3>
                            <p className="font-inter text-sm text-primary/80 mb-4">
                                {diet.description}
                            </p>
                            <button
                                onClick={() => handleSelect(diet.id)}
                                disabled={loading}
                                className="w-full px-6 py-3 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50"
                            >
                                {loading ? 'VÄLJER...' : 'VÄLJ DENNA'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : selectedDiet ? (
                /* Rules View */
                <div className="space-y-6">
                    <div>
                        <h2 className="font-teko text-3xl uppercase tracking-wider text-accent mb-2">
                            {selectedDiet.name}
                        </h2>
                        <p className="font-inter text-sm text-primary/80">
                            {selectedDiet.description}
                        </p>
                    </div>

                    {renderRules(selectedDiet.rules)}

                    {/* Only show "Byt Diet" button if not readOnly */}
                    {!readOnly && (
                        <button
                            onClick={() => setShowSelection(true)}
                            className="w-full px-6 py-3 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all"
                        >
                            BYT DIET
                        </button>
                    )}
                </div>
            ) : (
                /* No diet selected - show message */
                <div className="text-center py-8">
                    <p className="font-inter text-primary/60">
                        Ingen diet vald.
                    </p>
                    {readOnly && (
                        <p className="font-inter text-xs text-primary/40 mt-2">
                            (Välj diet vid nästa omstart)
                        </p>
                    )}
                </div>
            )}
        </Modal>
    );
}

