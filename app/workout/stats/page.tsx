/**
 * Workout Stats Page
 * Placeholder for future statistics features
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';

export default async function WorkoutStatsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background p-6 pb-24">
                <ServerHeader />

                <div className="mb-6">
                    <h1 className="font-teko text-5xl uppercase tracking-wider text-accent mb-1">
                        STATISTIK
                    </h1>
                    <p className="font-inter text-primary/80 text-sm">
                        Följ din utveckling över tid.
                    </p>
                </div>

                {/* Placeholder Content */}
                <div className="flex flex-col items-center justify-center py-20">
                    <span className="text-6xl mb-4">📊</span>
                    <h2 className="font-teko text-2xl text-primary/60 mb-2">
                        KOMMER SNART
                    </h2>
                    <p className="font-inter text-sm text-primary/40 text-center max-w-xs">
                        Här kommer du snart kunna se statistik över dina lyft, PRs, och träningshistorik.
                    </p>
                </div>

                {/* Future Feature Mockup */}
                <div className="space-y-4 opacity-50">
                    <div className="bg-surface border border-primary/20 p-4">
                        <h3 className="font-teko text-lg text-primary/60 mb-2">Volym denna vecka</h3>
                        <div className="h-24 bg-primary/5 rounded flex items-end justify-around p-2">
                            {[40, 60, 30, 80, 50, 0, 70].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-6 bg-accent/30 rounded-t"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface border border-primary/20 p-4">
                        <h3 className="font-teko text-lg text-primary/60 mb-2">Personliga Rekord</h3>
                        <div className="space-y-2">
                            {['Bänkpress', 'Knäböj', 'Marklyft'].map(exercise => (
                                <div key={exercise} className="flex justify-between items-center py-2 border-b border-primary/10 last:border-0">
                                    <span className="font-inter text-sm text-primary/60">{exercise}</span>
                                    <span className="font-inter text-sm text-primary/40">-- kg</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </MobileContainer>
    );
}
