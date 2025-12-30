/**
 * Admin Program Management Page
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import AdminProgramList from '@/components/admin/AdminProgramList';
import { getPrograms } from '@/lib/actions/workout';

export default async function AdminProgramsPage() {
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

    // Fetch programs
    const { data: programs } = await getPrograms();
    const systemPrograms = programs?.filter(p => p.is_system) || [];

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
                            PROGRAM
                        </h1>
                        <p className="font-inter text-primary/80">
                            {systemPrograms.length} systemprogram
                        </p>
                    </div>

                    <AdminProgramList programs={systemPrograms} />
                </div>
            </main>
        </MobileContainer>
    );
}
