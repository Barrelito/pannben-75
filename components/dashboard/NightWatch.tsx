/**
 * Night Watch Modal
 * Plan tomorrow's workouts and diet with calendar sync
 */

'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { generateGoogleCalendarLink, getTomorrowDate } from '@/lib/utils/calendar';
import type { PlanningData } from '@/types/logic.types';

interface NightWatchProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (planning: PlanningData) => Promise<void>;
    onComplete?: () => void;  // Called after successful submit
    initialData?: PlanningData;
    isPremium: boolean;
}

export default function NightWatch({
    isOpen,
    onClose,
    onSubmit,
    onComplete,
    initialData,
    isPremium,
}: NightWatchProps) {
    const [planning, setPlanning] = useState<PlanningData>({
        plan_workout_1: initialData?.plan_workout_1 || '',
        plan_workout_1_time: initialData?.plan_workout_1_time || '07:00',
        plan_workout_2: initialData?.plan_workout_2 || '',
        plan_workout_2_time: initialData?.plan_workout_2_time || '17:00',
        plan_diet: initialData?.plan_diet || '',
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit(planning);
            onClose();
            onComplete?.();  // Notify parent that planning is complete
        } catch (error) {
            console.error('Error saving planning:', error);
            alert('Kunde inte spara. Försök igen.');
        } finally {
            setLoading(false);
        }
    };

    const tomorrowDate = getTomorrowDate();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="NIGHT WATCH">
            <div className="space-y-6">
                <p className="font-inter text-sm text-primary/80">
                    Planera imorgons träning och diet
                </p>

                {/* Workout 1 */}
                <div className="space-y-3">
                    <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                        TRÄNING 1
                    </label>

                    <input
                        type="text"
                        value={planning.plan_workout_1 || ''}
                        onChange={(e) =>
                            setPlanning({ ...planning, plan_workout_1: e.target.value })
                        }
                        placeholder="t.ex. Morgonlöpning 5km"
                        className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                    />

                    <div className="flex gap-3 items-center">
                        <input
                            type="time"
                            value={planning.plan_workout_1_time || '07:00'}
                            onChange={(e) =>
                                setPlanning({ ...planning, plan_workout_1_time: e.target.value })
                            }
                            className="px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                        />

                        {isPremium && planning.plan_workout_1 ? (
                            <a
                                href={generateGoogleCalendarLink({
                                    title: `Träning: ${planning.plan_workout_1}`,
                                    date: tomorrowDate,
                                    startTime: planning.plan_workout_1_time || '07:00',
                                    durationMinutes: 45,
                                    description: 'Pannben 75 - Träning 1',
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-3 bg-accent text-background font-inter font-semibold text-xs uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all text-center"
                            >
                                📅 KALENDER
                            </a>
                        ) : (
                            <button
                                disabled
                                className="flex-1 px-4 py-3 bg-surface text-primary/30 font-inter font-semibold text-xs uppercase tracking-wider border-2 border-primary/20 cursor-not-allowed text-center"
                            >
                                🔒 KALENDER
                            </button>
                        )}
                    </div>
                </div>

                {/* Workout 2 */}
                <div className="space-y-3">
                    <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                        TRÄNING 2
                    </label>

                    <input
                        type="text"
                        value={planning.plan_workout_2 || ''}
                        onChange={(e) =>
                            setPlanning({ ...planning, plan_workout_2: e.target.value })
                        }
                        placeholder="t.ex. Styrka 1h"
                        className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                    />

                    <div className="flex gap-3 items-center">
                        <input
                            type="time"
                            value={planning.plan_workout_2_time || '17:00'}
                            onChange={(e) =>
                                setPlanning({ ...planning, plan_workout_2_time: e.target.value })
                            }
                            className="px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                        />

                        {isPremium && planning.plan_workout_2 ? (
                            <a
                                href={generateGoogleCalendarLink({
                                    title: `Träning: ${planning.plan_workout_2}`,
                                    date: tomorrowDate,
                                    startTime: planning.plan_workout_2_time || '17:00',
                                    durationMinutes: 45,
                                    description: 'Pannben 75 - Träning 2',
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-3 bg-accent text-background font-inter font-semibold text-xs uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all text-center"
                            >
                                📅 KALENDER
                            </a>
                        ) : (
                            <button
                                disabled
                                className="flex-1 px-4 py-3 bg-surface text-primary/30 font-inter font-semibold text-xs uppercase tracking-wider border-2 border-primary/20 cursor-not-allowed text-center"
                            >
                                🔒 KALENDER
                            </button>
                        )}
                    </div>
                </div>

                {/* Diet */}
                <div className="space-y-2">
                    <label className="block font-inter text-xs uppercase tracking-wider text-primary/60">
                        DIET FOKUS
                    </label>
                    <input
                        type="text"
                        value={planning.plan_diet || ''}
                        onChange={(e) =>
                            setPlanning({ ...planning, plan_diet: e.target.value })
                        }
                        placeholder="t.ex. Keto, 1800 kcal"
                        className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? 'SPARAR...' : 'SPARA PLAN'}
                </button>
            </div>
        </Modal>
    );
}
