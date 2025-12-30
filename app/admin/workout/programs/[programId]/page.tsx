/**
 * Admin Program Detail Page
 * Manage days and exercises for a specific program
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import ProgramEditor from '@/components/admin/ProgramEditor';
import { getExercises } from '@/lib/actions/workout';

interface PageProps {
    params: Promise<{ programId: string }>;
}

export default async function AdminProgramDetailPage({ params }: PageProps) {
    const { programId } = await params;
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

    // Fetch program details
    const { data: program } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('id', programId)
        .single();

    if (!program) {
        return <div>Program not found</div>;
    }

    // Fetch program days and exercises
    const { data: days } = await supabase
        .from('program_days')
        .select(`
            *,
            exercises:program_exercises(
                *,
                exercise:exercises(*)
            )
        `)
        .eq('program_id', programId)
        .order('day_number', { ascending: true });

    // Fetch all available exercises for the dropdown
    const { data: allExercises } = await getExercises();
    // Sort exercises by name
    const sortedExercises = allExercises?.sort((a, b) => a.name.localeCompare(b.name)) || [];

    const programDays = days || [];

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background">
                <div className="p-6 pb-20">
                    <ServerHeader />

                    {/* Back Link */}
                    <Link
                        href="/admin/workout/programs"
                        className="inline-flex items-center gap-2 font-inter text-sm text-primary/60 hover:text-primary mb-4"
                    >
                        ← Tillbaka till program
                    </Link>

                    {/* Header */}
                    <div className="mb-8 border-l-4 border-accent pl-4">
                        <h1 className="font-teko text-4xl uppercase tracking-wider text-primary mb-1">
                            {program.name}
                        </h1>
                        <p className="font-inter text-primary/80 text-sm">
                            {program.days_per_week} dagar/vecka • {program.duration_weeks} veckor
                        </p>
                    </div>

                    {/* Editor */}
                    <ProgramEditor
                        program={program as any}
                        programDays={programDays as any}
                        allExercises={sortedExercises}
                    />
                </div>
            </main>
        </MobileContainer>
    );
}
