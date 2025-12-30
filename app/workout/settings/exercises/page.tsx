/**
 * My Exercises Settings Page
 * Manage user's custom exercises
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';

export default async function MyExercisesSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user's custom exercises
    const { data: myExercises } = await supabase
        .from('exercises')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_system', false)
        .order('name');

    const exercises = myExercises || [];

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background p-6 pb-24">
                <ServerHeader />

                {/* Back Link */}
                <Link
                    href="/workout/settings"
                    className="inline-flex items-center gap-2 font-inter text-sm text-primary/60 hover:text-primary mb-4"
                >
                    ← Tillbaka
                </Link>

                <div className="mb-6">
                    <h1 className="font-teko text-4xl uppercase tracking-wider text-accent mb-1">
                        MINA ÖVNINGAR
                    </h1>
                    <p className="font-inter text-primary/80 text-sm">
                        Övningar du skapat själv.
                    </p>
                </div>

                {/* Create New Exercise Button */}
                <div className="mb-8">
                    <button
                        disabled
                        className="w-full py-4 border-2 border-dashed border-primary/30 text-primary/50 font-teko text-xl uppercase tracking-wider opacity-60 cursor-not-allowed"
                    >
                        + SKAPA NY ÖVNING (Kommer snart)
                    </button>
                </div>

                {/* My Exercises List */}
                <div>
                    <h2 className="font-teko text-xl text-primary/80 uppercase mb-3">
                        Mina övningar ({exercises.length})
                    </h2>

                    {exercises.length === 0 ? (
                        <div className="p-6 border border-dashed border-primary/20 text-center">
                            <p className="font-inter text-sm text-primary/60">
                                Du har inga egna övningar ännu.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {exercises.map((exercise: any) => (
                                <div
                                    key={exercise.id}
                                    className="bg-surface border border-primary/20 p-3 flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-inter font-medium text-primary">
                                            {exercise.name}
                                        </h3>
                                        <p className="font-inter text-xs text-primary/60">
                                            {exercise.muscle_group} • {exercise.equipment || 'Kroppsvikt'}
                                        </p>
                                    </div>
                                    {/* Future: Edit/Delete buttons */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </MobileContainer>
    );
}
