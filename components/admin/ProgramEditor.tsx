'use client';

import { useState, useEffect } from 'react';
import type { ProgramDay, ProgramExercise, Exercise, WorkoutProgram, MuscleGroup } from '@/types/database.types';
import { addProgramDay, deleteProgramDay, addProgramExercise, deleteProgramExercise, copyProgramWeek, createSystemExercise } from '@/lib/actions/workout-admin';

const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
    { value: 'bröst', label: 'Bröst' },
    { value: 'rygg', label: 'Rygg' },
    { value: 'axlar', label: 'Axlar' },
    { value: 'biceps', label: 'Biceps' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'ben', label: 'Ben' },
    { value: 'core', label: 'Core/Mage' },
    { value: 'cardio', label: 'Kondition' },
];

interface ProgramEditorProps {
    program: WorkoutProgram;
    programDays: (ProgramDay & { exercises: (ProgramExercise & { exercise: Exercise | null })[] })[];
    allExercises: Exercise[];
}

export default function ProgramEditor({ program, programDays, allExercises }: ProgramEditorProps) {
    const totalWeeks = program.duration_weeks || 4;
    const daysPerWeek = program.days_per_week || 3;

    const [activeWeek, setActiveWeek] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showExerciseForm, setShowExerciseForm] = useState<string | null>(null);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showCreateExercise, setShowCreateExercise] = useState(false);

    // Exercise Form State
    const [selectedExerciseId, setSelectedExerciseId] = useState('');
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState('8-12');
    const [notes, setNotes] = useState('');
    const [exerciseSearch, setExerciseSearch] = useState('');

    // Create Exercise Form State
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseMuscle, setNewExerciseMuscle] = useState<MuscleGroup>('bröst');

    // Filter days for active week
    const weekDays = programDays
        .filter(d => d.week_number === activeWeek)
        .sort((a, b) => a.day_number - b.day_number);

    // Check which weeks have content
    const weeksWithContent = new Set(programDays.map(d => d.week_number));

    const filteredExercises = allExercises.filter(e =>
        e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
    );

    // Auto-select first matching exercise when search changes
    useEffect(() => {
        if (showExerciseForm && filteredExercises.length > 0) {
            setSelectedExerciseId(filteredExercises[0].id);
        }
    }, [exerciseSearch, showExerciseForm]);

    // Generate array of week numbers
    const weekNumbers = Array.from({ length: totalWeeks }, (_, i) => i + 1);

    const handleAddDay = async (dayNumber: number) => {
        const name = prompt(`Namn på dag ${dayNumber} (t.ex. "Push" eller "Ben")`);
        if (name === null) return; // Cancelled

        setIsLoading(true);
        const { error } = await addProgramDay(program.id, {
            week_number: activeWeek,
            day_number: dayNumber,
            name: name || `Dag ${dayNumber}`,
        });

        if (error) alert(error);
        else location.reload();
        setIsLoading(false);
    };

    const handleDeleteDay = async (dayId: string) => {
        if (!confirm('Ta bort dag och alla dess övningar?')) return;
        setIsLoading(true);
        await deleteProgramDay(dayId);
        location.reload();
    };

    const handleAddExercise = async (dayId: string) => {
        if (!selectedExerciseId) return;

        let repsMin = 0;
        let repsMax = 0;

        if (reps.includes('-')) {
            const parts = reps.split('-').map(p => parseInt(p.trim()));
            repsMin = parts[0] || 0;
            repsMax = parts[1] || repsMin;
        } else {
            repsMin = parseInt(reps) || 0;
            repsMax = repsMin;
        }

        setIsLoading(true);
        const { error } = await addProgramExercise(dayId, {
            exercise_id: selectedExerciseId,
            sets,
            reps_min: repsMin,
            reps_max: repsMax,
            rest_seconds: 60,
            notes: notes || null,
            order_index: 999,
        });

        if (error) alert(error);
        else {
            setShowExerciseForm(null);
            location.reload();
        }
        setIsLoading(false);
    };

    const handleDeleteExercise = async (exerciseId: string) => {
        if (!confirm('Ta bort övning?')) return;
        setIsLoading(true);
        await deleteProgramExercise(exerciseId);
        location.reload();
    };

    const handleCopyWeek = async (targetWeek: number) => {
        if (targetWeek === activeWeek) return;

        const confirmMsg = weeksWithContent.has(targetWeek)
            ? `Ersätta vecka ${targetWeek} med innehållet från vecka ${activeWeek}?`
            : `Kopiera vecka ${activeWeek} till vecka ${targetWeek}?`;

        if (!confirm(confirmMsg)) return;

        setIsLoading(true);
        const { error } = await copyProgramWeek(program.id, activeWeek, targetWeek);
        if (error) alert(error);
        else location.reload();
        setIsLoading(false);
        setShowCopyModal(false);
    };

    const handleCopyToAll = async () => {
        if (!confirm(`Kopiera vecka ${activeWeek} till ALLA andra veckor? Detta ersätter befintligt innehåll.`)) return;

        setIsLoading(true);
        for (let week = 1; week <= totalWeeks; week++) {
            if (week !== activeWeek) {
                const { error } = await copyProgramWeek(program.id, activeWeek, week);
                if (error) {
                    alert(`Fel vid kopiering till vecka ${week}: ${error}`);
                    break;
                }
            }
        }
        location.reload();
    };

    const handleCreateExercise = async () => {
        if (!newExerciseName.trim()) {
            alert('Namn krävs');
            return;
        }

        setIsLoading(true);
        const { data, error } = await createSystemExercise({
            name: newExerciseName.trim(),
            muscle_group: newExerciseMuscle,
            equipment: 'kroppsvikt',
            category: 'strength',
            is_compound: false,
        });

        if (error) {
            alert(error);
        } else if (data) {
            // Auto-select the newly created exercise
            setSelectedExerciseId(data.id);
            setShowCreateExercise(false);
            setNewExerciseName('');
            // Reload to get the new exercise in the list
            location.reload();
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Week Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-primary/20 pb-4">
                {weekNumbers.map(week => (
                    <button
                        key={week}
                        onClick={() => setActiveWeek(week)}
                        className={`px-4 py-2 font-teko text-lg uppercase tracking-wider transition-colors
                            ${activeWeek === week
                                ? 'bg-accent text-background'
                                : weeksWithContent.has(week)
                                    ? 'bg-surface border border-primary/40 text-primary hover:border-accent'
                                    : 'bg-surface border border-dashed border-primary/20 text-primary/40 hover:text-primary/60'
                            }`}
                    >
                        V{week}
                    </button>
                ))}
            </div>

            {/* Week Header with Copy Button */}
            <div className="flex justify-between items-center">
                <h2 className="font-teko text-3xl text-accent">
                    VECKA {activeWeek}
                </h2>
                <div className="flex gap-2">
                    {weekDays.length > 0 && (
                        <>
                            <button
                                onClick={() => setShowCopyModal(!showCopyModal)}
                                className="px-3 py-1 bg-surface border border-primary/30 text-primary text-sm font-inter hover:border-accent"
                            >
                                📋 Kopiera vecka
                            </button>
                            <button
                                onClick={handleCopyToAll}
                                disabled={isLoading}
                                className="px-3 py-1 bg-surface border border-primary/30 text-primary text-sm font-inter hover:border-accent"
                            >
                                📋 Kopiera till alla
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Copy Modal */}
            {showCopyModal && (
                <div className="bg-surface border border-accent p-4 space-y-3">
                    <p className="font-inter text-sm text-primary">Kopiera vecka {activeWeek} till:</p>
                    <div className="flex flex-wrap gap-2">
                        {weekNumbers.filter(w => w !== activeWeek).map(week => (
                            <button
                                key={week}
                                onClick={() => handleCopyWeek(week)}
                                disabled={isLoading}
                                className={`px-4 py-2 font-teko text-lg border transition-colors
                                    ${weeksWithContent.has(week)
                                        ? 'border-yellow-500/50 text-yellow-400 hover:border-yellow-500'
                                        : 'border-primary/30 text-primary hover:border-accent'
                                    }`}
                            >
                                V{week}
                                {weeksWithContent.has(week) && ' ⚠️'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowCopyModal(false)}
                        className="text-primary/60 text-sm hover:text-primary"
                    >
                        Avbryt
                    </button>
                </div>
            )}

            {/* Days Grid */}
            <div className="grid gap-4">
                {Array.from({ length: daysPerWeek }, (_, i) => i + 1).map(dayNum => {
                    const day = weekDays.find(d => d.day_number === dayNum);

                    return (
                        <div key={dayNum} className="bg-surface border border-primary/20 p-4">
                            {day ? (
                                <>
                                    {/* Day Header */}
                                    <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                                        <h3 className="font-teko text-xl text-primary">
                                            <span className="text-accent">DAG {dayNum}</span>
                                            {day.name && ` — ${day.name}`}
                                        </h3>
                                        <button
                                            onClick={() => handleDeleteDay(day.id)}
                                            className="text-primary/60 hover:text-red-500 text-sm"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {/* Exercises */}
                                    <div className="space-y-2 mb-4">
                                        {day.exercises?.sort((a, b) => a.order_index - b.order_index).map((ex) => (
                                            <div key={ex.id} className="flex justify-between items-center bg-background p-2 border border-primary/10">
                                                <div>
                                                    <p className="font-inter text-primary font-medium text-sm">
                                                        {ex.exercise?.name || 'Okänd övning'}
                                                    </p>
                                                    <p className="font-inter text-xs text-primary/60">
                                                        {ex.sets} set × {ex.reps_min === ex.reps_max ? ex.reps_min : `${ex.reps_min}-${ex.reps_max}`} reps
                                                        {ex.notes && ` • ${ex.notes}`}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteExercise(ex.id)}
                                                    className="text-primary/40 hover:text-red-500 text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Exercise Form */}
                                    {showExerciseForm === day.id ? (
                                        <div className="bg-background p-3 border border-accent/50 space-y-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={exerciseSearch}
                                                    onChange={e => setExerciseSearch(e.target.value)}
                                                    className="w-full bg-surface border border-primary/20 p-2 text-sm text-primary mb-2"
                                                    placeholder="Sök övning..."
                                                    autoFocus
                                                />
                                                <select
                                                    value={selectedExerciseId}
                                                    onChange={e => setSelectedExerciseId(e.target.value)}
                                                    className="w-full bg-surface border border-primary/20 p-2 text-sm text-primary"
                                                    size={4}
                                                >
                                                    {filteredExercises.slice(0, 20).map(e => (
                                                        <option key={e.id} value={e.id}>
                                                            {e.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Create new exercise button */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowCreateExercise(!showCreateExercise);
                                                        setNewExerciseName(exerciseSearch);
                                                    }}
                                                    className="mt-2 w-full py-1 border border-dashed border-primary/30 text-primary/60 text-xs hover:border-accent hover:text-accent"
                                                >
                                                    + Skapa ny övning
                                                </button>

                                                {/* Quick Create Exercise Modal */}
                                                {showCreateExercise && (
                                                    <div className="mt-2 p-3 bg-surface border border-accent space-y-2">
                                                        <p className="text-xs text-accent font-semibold uppercase">Ny övning</p>
                                                        <input
                                                            type="text"
                                                            value={newExerciseName}
                                                            onChange={e => setNewExerciseName(e.target.value)}
                                                            className="w-full bg-background border border-primary/20 p-2 text-sm text-primary"
                                                            placeholder="Övningens namn..."
                                                            autoFocus
                                                        />
                                                        <select
                                                            value={newExerciseMuscle}
                                                            onChange={e => setNewExerciseMuscle(e.target.value as MuscleGroup)}
                                                            className="w-full bg-background border border-primary/20 p-2 text-sm text-primary"
                                                        >
                                                            {MUSCLE_GROUPS.map(m => (
                                                                <option key={m.value} value={m.value}>
                                                                    {m.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={handleCreateExercise}
                                                                disabled={isLoading || !newExerciseName.trim()}
                                                                className="flex-1 bg-accent text-background py-1 text-xs font-semibold uppercase disabled:opacity-50"
                                                            >
                                                                {isLoading ? 'Skapar...' : 'Skapa'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowCreateExercise(false)}
                                                                className="px-3 border border-primary/20 text-primary/60 text-xs"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-primary/60 uppercase">Set</label>
                                                    <input
                                                        type="number"
                                                        value={sets}
                                                        onChange={e => setSets(parseInt(e.target.value) || 3)}
                                                        className="w-full bg-surface border border-primary/20 p-2 text-sm text-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-primary/60 uppercase">Reps</label>
                                                    <input
                                                        type="text"
                                                        value={reps}
                                                        onChange={e => setReps(e.target.value)}
                                                        className="w-full bg-surface border border-primary/20 p-2 text-sm text-primary"
                                                        placeholder="8-12"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-primary/60 uppercase">Notering</label>
                                                    <input
                                                        type="text"
                                                        value={notes}
                                                        onChange={e => setNotes(e.target.value)}
                                                        className="w-full bg-surface border border-primary/20 p-2 text-sm text-primary"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAddExercise(day.id)}
                                                    disabled={!selectedExerciseId}
                                                    className="flex-1 bg-accent text-background py-2 text-sm font-semibold uppercase disabled:opacity-50"
                                                >
                                                    Lägg till
                                                </button>
                                                <button
                                                    onClick={() => setShowExerciseForm(null)}
                                                    className="px-4 border border-primary/20 text-primary text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setShowExerciseForm(day.id);
                                                setExerciseSearch('');
                                                setSelectedExerciseId(allExercises[0]?.id || '');
                                                setSets(3);
                                                setReps('8-12');
                                                setNotes('');
                                            }}
                                            className="w-full py-2 border border-dashed border-primary/20 text-primary/50 text-sm hover:border-accent hover:text-accent"
                                        >
                                            + Lägg till övning
                                        </button>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => handleAddDay(dayNum)}
                                    disabled={isLoading}
                                    className="w-full py-8 border-2 border-dashed border-primary/20 text-primary/40 font-teko text-xl uppercase hover:border-accent hover:text-accent transition-colors"
                                >
                                    + SKAPA DAG {dayNum}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
