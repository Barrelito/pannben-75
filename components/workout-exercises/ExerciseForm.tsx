'use client';

import { useState } from 'react';
import type { Exercise, ExerciseInsert } from '@/types/database.types';
import { createExercise } from '@/lib/actions/workout';

interface ExerciseFormProps {
    onSuccess: (exercise: Exercise) => void;
    onCancel: () => void;
}

const MUSCLE_GROUPS = [
    { value: 'bröst', label: 'Bröst' },
    { value: 'rygg', label: 'Rygg' },
    { value: 'ben', label: 'Ben' },
    { value: 'axlar', label: 'Axlar' },
    { value: 'biceps', label: 'Biceps' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'core', label: 'Core' },
    { value: 'cardio', label: 'Cardio' },
];

const EQUIPMENT = [
    { value: 'skivstång', label: 'Skivstång' },
    { value: 'hantlar', label: 'Hantlar' },
    { value: 'kabel', label: 'Kabel' },
    { value: 'maskin', label: 'Maskin' },
    { value: 'kroppsvikt', label: 'Kroppsvikt' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'inget', label: 'Inget' },
    { value: 'cykel', label: 'Cykel' },
    { value: 'hopprep', label: 'Hopprep' },
];

export default function ExerciseForm({ onSuccess, onCancel }: ExerciseFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<ExerciseInsert, 'id' | 'created_by' | 'is_system'>>({
        name: '',
        muscle_group: 'bröst',
        equipment: 'skivstång',
        category: 'strength',
        is_compound: false,
        description: '',
        instructions: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Fyll i övningens namn');
            return;
        }

        setIsLoading(true);
        const { data, error } = await createExercise(formData);

        if (error) {
            alert(error);
        } else if (data) {
            onSuccess(data);
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
                <label className="block font-inter text-xs uppercase tracking-wider text-primary/60 mb-1">
                    Namn
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-background border border-primary/20 px-4 py-3 font-inter text-primary focus:border-accent focus:outline-none"
                    placeholder="T.ex. Bänkpress smalt grepp"
                    autoFocus
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Muscle Group */}
                <div>
                    <label className="block font-inter text-xs uppercase tracking-wider text-primary/60 mb-1">
                        Muskelgrupp
                    </label>
                    <select
                        value={formData.muscle_group}
                        onChange={(e) => setFormData(prev => ({ ...prev, muscle_group: e.target.value }))}
                        className="w-full bg-background border border-primary/20 px-4 py-3 font-inter text-primary focus:border-accent focus:outline-none appearance-none"
                    >
                        {MUSCLE_GROUPS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Equipment */}
                <div>
                    <label className="block font-inter text-xs uppercase tracking-wider text-primary/60 mb-1">
                        Utrustning
                    </label>
                    <select
                        value={formData.equipment || 'skivstång'}
                        onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                        className="w-full bg-background border border-primary/20 px-4 py-3 font-inter text-primary focus:border-accent focus:outline-none appearance-none"
                    >
                        {EQUIPMENT.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block font-inter text-xs uppercase tracking-wider text-primary/60 mb-1">
                    Beskrivning (frivilligt)
                </label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-background border border-primary/20 px-4 py-3 font-inter text-primary focus:border-accent focus:outline-none min-h-[100px]"
                    placeholder="Beskriv övningen..."
                />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 border-2 border-primary/20 text-primary font-inter font-semibold text-sm uppercase tracking-wider hover:border-primary/40 transition-colors"
                >
                    Avbryt
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-accent text-background border-2 border-accent font-inter font-semibold text-sm uppercase tracking-wider hover:bg-transparent hover:text-accent transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Sparar...' : 'Spara övning'}
                </button>
            </div>
        </form>
    );
}
