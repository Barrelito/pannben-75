/**
 * BMR Calculator Component (Modal Version)
 * Calculate Base Metabolic Rate using Mifflin-St Jeor equation
 */

'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface BMRCalculatorProps {
    onClose: () => void;
}

export default function BMRCalculator({ onClose }: BMRCalculatorProps) {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [sex, setSex] = useState<'male' | 'female'>('male');
    const [bmr, setBmr] = useState<number | null>(null);

    const calculateBMR = () => {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseFloat(age);

        if (isNaN(w) || isNaN(h) || isNaN(a)) {
            alert('Fyll i alla fält med giltiga nummer');
            return;
        }

        // Mifflin-St Jeor Formula
        let result: number;
        if (sex === 'male') {
            result = 10 * w + 6.25 * h - 5 * a + 5;
        } else {
            result = 10 * w + 6.25 * h - 5 * a - 161;
        }

        setBmr(Math.round(result));
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="BMR KALKYLATOR">
            <div className="space-y-4">
                <p className="font-inter text-xs text-primary/60">
                    Basalomsättning (BMR) - kalorier din kropp förbränner i vila
                </p>

                {/* Weight */}
                <div className="space-y-2">
                    <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                        VIKT (KG)
                    </label>
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="75"
                        className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                    />
                </div>

                {/* Height */}
                <div className="space-y-2">
                    <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                        LÄNGD (CM)
                    </label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="180"
                        className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                    />
                </div>

                {/* Age */}
                <div className="space-y-2">
                    <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                        ÅLDER
                    </label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="30"
                        className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                    />
                </div>

                {/* Sex */}
                <div className="space-y-2">
                    <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                        KÖN
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSex('male')}
                            className={`flex-1 px-4 py-3 font-inter font-semibold text-sm uppercase tracking-wider border-2 transition-all ${sex === 'male'
                                    ? 'bg-accent text-background border-accent'
                                    : 'bg-background text-primary border-primary/20 hover:border-accent/50'
                                }`}
                        >
                            MAN
                        </button>
                        <button
                            onClick={() => setSex('female')}
                            className={`flex-1 px-4 py-3 font-inter font-semibold text-sm uppercase tracking-wider border-2 transition-all ${sex === 'female'
                                    ? 'bg-accent text-background border-accent'
                                    : 'bg-background text-primary border-primary/20 hover:border-accent/50'
                                }`}
                        >
                            KVINNA
                        </button>
                    </div>
                </div>

                {/* Calculate Button */}
                <button
                    onClick={calculateBMR}
                    className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                >
                    BERÄKNA
                </button>

                {/* Result */}
                {bmr !== null && (
                    <div className="p-4 bg-background border-2 border-accent">
                        <div className="font-teko text-2xl text-accent mb-2">
                            RESULTAT: {bmr} kcal/dag
                        </div>
                        <div className="font-inter text-sm text-primary/80">
                            Med aktivitet (x1.5): <span className="font-semibold text-accent">{Math.round(bmr * 1.5)} kcal/dag</span>
                        </div>
                        <div className="font-inter text-xs text-primary/60 mt-2">
                            Detta är din basalomsättning. Lägg till aktivitetsfaktor för totalt behov.
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
