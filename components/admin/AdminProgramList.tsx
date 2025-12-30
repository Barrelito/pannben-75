'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WorkoutProgram, WorkoutProgramInsert } from '@/types/database.types';
import { createSystemProgram, updateSystemProgram, deleteSystemProgram } from '@/lib/actions/workout-admin';

interface AdminProgramListProps {
    programs: WorkoutProgram[];
}

const DIFFICULTY_OPTIONS = [
    { value: 'beginner', label: 'Nybörjare' },
    { value: 'intermediate', label: 'Medel' },
    { value: 'advanced', label: 'Avancerad' },
];

const GOAL_OPTIONS = [
    { value: 'strength', label: 'Styrka' },
    { value: 'hypertrophy', label: 'Muskelbyggnad' },
    { value: 'powerlifting', label: 'Styrkelyft' },
    { value: 'general', label: 'Allmän' },
    { value: 'endurance', label: 'Uthållighet' },
];

type FormData = Omit<WorkoutProgramInsert, 'id' | 'created_by' | 'is_system'>;

const emptyForm: FormData = {
    name: '',
    description: '',
    difficulty: 'beginner',
    goal: 'general',
    days_per_week: 3,
    duration_weeks: 8,
    is_premium: false,
};

// Extracted ProgramForm component to prevent re-mounting issues
const ProgramForm = ({
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
            <div className="col-span-2">
                <label className="block font-inter text-xs uppercase text-primary/60 mb-1">Beskrivning</label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-background border border-primary/20 px-3 py-2 font-inter text-primary min-h-[80px]"
                />
            </div>
            <div>
                <label className="block font-inter text-xs uppercase text-primary/60 mb-1">Svårighetsgrad</label>
                <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                    className="w-full bg-background border border-primary/20 px-3 py-2 font-inter text-primary"
                >
                    {DIFFICULTY_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block font-inter text-xs uppercase text-primary/60 mb-1">Mål</label>
                <select
                    value={formData.goal}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value as 'strength' | 'hypertrophy' | 'powerlifting' | 'general' | 'endurance' }))}
                    className="w-full bg-background border border-primary/20 px-3 py-2 font-inter text-primary"
                >
                    {GOAL_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block font-inter text-xs uppercase text-primary/60 mb-1">Dagar/vecka</label>
                <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.days_per_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, days_per_week: parseInt(e.target.value) || 3 }))}
                    className="w-full bg-background border border-primary/20 px-3 py-2 font-inter text-primary"
                />
            </div>
            <div>
                <label className="block font-inter text-xs uppercase text-primary/60 mb-1">Veckor</label>
                <input
                    type="number"
                    min="1"
                    max="52"
                    value={formData.duration_weeks || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) || null }))}
                    className="w-full bg-background border border-primary/20 px-3 py-2 font-inter text-primary"
                />
            </div>
            <div className="col-span-2 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_premium: e.target.checked }))}
                    className="w-4 h-4"
                />
                <label className="font-inter text-sm text-primary">Premium-program</label>
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

export default function AdminProgramList({ programs }: AdminProgramListProps) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Fyll i namn');
            return;
        }

        setIsLoading(true);
        const { error } = await createSystemProgram(formData);
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
        const { error } = await updateSystemProgram(editingId, formData);
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
        if (!confirm('Ta bort detta program?')) return;

        const { error } = await deleteSystemProgram(id);
        if (error) {
            alert(error);
        } else {
            router.refresh();
        }
    };

    const startEdit = (program: WorkoutProgram) => {
        setFormData({
            name: program.name,
            description: program.description,
            difficulty: program.difficulty,
            goal: program.goal,
            days_per_week: program.days_per_week,
            duration_weeks: program.duration_weeks,
            is_premium: program.is_premium,
        });
        setEditingId(program.id);
        setShowForm(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData(emptyForm);
        setShowForm(false);
    };

    return (
        <div className="space-y-4">
            {/* Add Button */}
            {!showForm && !editingId && (
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
                    className="w-full px-4 py-3 bg-accent text-background font-inter text-sm uppercase tracking-wider"
                >
                    + Nytt program
                </button>
            )}

            {/* Create Form */}
            {showForm && (
                <ProgramForm
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
                {programs.map(program => (
                    <div key={program.id}>
                        {editingId === program.id ? (
                            <ProgramForm
                                formData={formData}
                                setFormData={setFormData}
                                onSubmit={handleUpdate}
                                onCancel={cancelEdit}
                                isLoading={isLoading}
                                submitLabel="Uppdatera"
                            />
                        ) : (
                            <div className="bg-surface border border-primary/20 p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-teko text-xl uppercase tracking-wider text-primary">
                                                {program.name}
                                            </h3>
                                            {program.is_premium && (
                                                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] uppercase font-inter">
                                                    Premium
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-inter text-xs text-primary/60 mt-1">
                                            {DIFFICULTY_OPTIONS.find(d => d.value === program.difficulty)?.label} • {GOAL_OPTIONS.find(g => g.value === program.goal)?.label} • {program.days_per_week} dagar/v
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(program)}
                                            className="text-primary/60 hover:text-accent text-sm"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(program.id)}
                                            className="text-primary/60 hover:text-red-500 text-sm"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                {program.description && (
                                    <p className="font-inter text-sm text-primary/70 line-clamp-2">
                                        {program.description}
                                    </p>
                                )}
                                <a
                                    href={`/admin/workout/programs/${program.id}`}
                                    className="inline-block mt-3 font-inter text-xs text-accent hover:underline"
                                >
                                    Redigera dagar →
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
