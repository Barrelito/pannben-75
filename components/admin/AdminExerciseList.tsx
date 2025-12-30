'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Exercise, ExerciseInsert } from '@/types/database.types';
import { createSystemExercise, updateSystemExercise, deleteSystemExercise } from '@/lib/actions/workout-admin';

interface AdminExerciseListProps {
    exercises: Exercise[];
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
];

type FormData = Omit<ExerciseInsert, 'id' | 'created_by' | 'is_system'>;

const emptyForm: FormData = {
    name: '',
    muscle_group: 'bröst',
    equipment: 'skivstång',
    category: 'strength',
    is_compound: false,
    description: '',
    instructions: '',
};

// Extracted ExerciseForm component
const ExerciseForm = ({
    formData,
    setFormData,
    onSubmit,
    onCancel,
    isLoading,
    submitLabel
}: {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading: boolean;
    submitLabel: string;
}) => (
    <form onSubmit={onSubmit} className="bg-surface border border-accent p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block font-inter text-xs uppercase text-primary/60 mb-1">Namn</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-background border border-primary/20 px-3 py-2 font-inter text-primary"
                    autoFocus
                />
            </div>
            <div>
                <label className="block font-inter text-xs uppercase text-primary/60 mb-1">Muskelgrupp</label>
                <select
                    value={formData.muscle_group}
                    onChange={(e) => setFormData(prev => ({ ...prev, muscle_group: e.target.value }))}
                    className="w-full bg-background border border-primary/20 px-3 py-2 font-inter text-primary"
                >
                    {MUSCLE_GROUPS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block font-inter text-xs uppercase text-primary/60 mb-1">Utrustning</label>
                <select
                    value={formData.equipment || 'skivstång'}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                    className="w-full bg-background border border-primary/20 px-3 py-2 font-inter text-primary"
                >
                    {EQUIPMENT.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
            </div>
            <div className="col-span-2">
                <label className="block font-inter text-xs uppercase text-primary/60 mb-1">Beskrivning</label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-background border border-primary/20 px-3 py-2 font-inter text-primary min-h-[80px]"
                />
            </div>
            <div className="col-span-2 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={formData.is_compound}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_compound: e.target.checked }))}
                    className="w-4 h-4"
                />
                <label className="font-inter text-sm text-primary">Sammansatt övning</label>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-accent text-background font-inter text-sm uppercase"
            >
                {isLoading ? '...' : submitLabel}
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-primary/20 text-primary font-inter text-sm uppercase"
            >
                Avbryt
            </button>
        </div>
    </form>
);

export default function AdminExerciseList({ exercises }: AdminExerciseListProps) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMuscle, setFilterMuscle] = useState<string | null>(null);

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMuscle = filterMuscle ? ex.muscle_group === filterMuscle : true;
        return matchesSearch && matchesMuscle;
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Fyll i namn');
            return;
        }

        setIsLoading(true);
        const { error } = await createSystemExercise(formData);
        if (error) {
            alert(error);
        } else {
            setFormData(emptyForm);
            setShowForm(false);
            router.refresh();
        }
        setIsLoading(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId || !formData.name.trim()) return;

        setIsLoading(true);
        const { error } = await updateSystemExercise(editingId, formData);
        if (error) {
            alert(error);
        } else {
            setEditingId(null);
            setFormData(emptyForm);
            router.refresh();
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Ta bort denna övning?')) return;

        const { error } = await deleteSystemExercise(id);
        if (error) {
            alert(error);
        } else {
            router.refresh();
        }
    };

    const startEdit = (exercise: Exercise) => {
        setFormData({
            name: exercise.name,
            muscle_group: exercise.muscle_group,
            equipment: exercise.equipment,
            category: exercise.category,
            is_compound: exercise.is_compound,
            description: exercise.description,
            instructions: exercise.instructions,
        });
        setEditingId(exercise.id);
        setShowForm(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData(emptyForm);
        setShowForm(false);
    };

    return (
        <div className="space-y-4">
            {/* Search and Add */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sök..."
                    className="flex-1 bg-background border border-primary/20 px-3 py-2 font-inter text-primary"
                />
                {!showForm && !editingId && (
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
                        className="px-4 py-2 bg-accent text-background font-inter text-xl"
                    >
                        +
                    </button>
                )}
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilterMuscle(null)}
                    className={`px-2 py-1 text-xs font-inter uppercase border ${!filterMuscle ? 'bg-accent text-background border-accent' : 'border-primary/20 text-primary/60'}`}
                >
                    Alla
                </button>
                {MUSCLE_GROUPS.map(m => (
                    <button
                        key={m.value}
                        onClick={() => setFilterMuscle(m.value)}
                        className={`px-2 py-1 text-xs font-inter uppercase border whitespace-nowrap ${filterMuscle === m.value ? 'bg-accent text-background border-accent' : 'border-primary/20 text-primary/60'}`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Create Form */}
            {showForm && (
                <ExerciseForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleCreate}
                    onCancel={cancelEdit}
                    isLoading={isLoading}
                    submitLabel="Skapa"
                />
            )}

            {/* List */}
            <div className="space-y-2">
                {filteredExercises.map(exercise => (
                    <div key={exercise.id}>
                        {editingId === exercise.id ? (
                            <ExerciseForm
                                formData={formData}
                                setFormData={setFormData}
                                onSubmit={handleUpdate}
                                onCancel={cancelEdit}
                                isLoading={isLoading}
                                submitLabel="Uppdatera"
                            />
                        ) : (
                            <div className="bg-surface border border-primary/20 p-3 flex items-center justify-between">
                                <div>
                                    <p className="font-inter text-primary font-medium">{exercise.name}</p>
                                    <p className="font-inter text-xs text-primary/60">
                                        {MUSCLE_GROUPS.find(m => m.value === exercise.muscle_group)?.label} • {exercise.equipment}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(exercise)}
                                        className="text-primary/60 hover:text-accent text-sm"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(exercise.id)}
                                        className="text-primary/60 hover:text-red-500 text-sm"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
