/**
 * Admin Exercise Management Page
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import AdminExerciseList from '@/components/admin/AdminExerciseList';
import { getExercises } from '@/lib/actions/workout';

export default async function AdminExercisesPage() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check admin status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        redirect('/dashboard');
    }

    // Fetch exercises
    const { data: exercises } = await getExercises();
    const systemExercises = exercises?.filter(e => e.is_system) || [];

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background">
                <div className="p-6 pb-20">
                    <ServerHeader />

                    {/* Back Link */}
                    <Link
                        href="/admin/workout"
                        className="inline-flex items-center gap-2 font-inter text-sm text-primary/60 hover:text-primary mb-4"
                    >
                        ← Tillbaka
                    </Link>

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-teko text-4xl uppercase tracking-wider text-accent mb-2">
                            ÖVNINGAR
                        </h1>
                        <p className="font-inter text-primary/80">
                            {systemExercises.length} systemövningar
                        </p>
                    </div>

                    <AdminExerciseList exercises={systemExercises} />
                </div>
            </main>
        </MobileContainer>
    );
}
