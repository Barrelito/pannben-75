/**
 * Program Browser Page
 * Browse and subscribe to workout programs
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import ProgramList from '@/components/workout-programs/ProgramList';
import { getPrograms, getUserPrograms } from '@/lib/actions/workout';

export default async function ProgramBrowserPage() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check premium status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

    if (!profile?.is_premium) {
        return (
            <MobileContainer>
                <main className="min-h-screen bg-background p-6">
                    <ServerHeader />
                    <div className="bg-surface border-2 border-accent p-8 text-center mt-8">
                        <span className="text-5xl mb-4 block">📋</span>
                        <h2 className="font-teko text-3xl uppercase tracking-wider text-accent mb-2">
                            TRÄNINGSPROGRAM
                        </h2>
                        <p className="font-inter text-primary/80 mb-6">
                            Följ strukturerade program för att nå dina mål.
                        </p>
                        <p className="font-inter text-sm text-accent mb-4">
                            Kräver Premium
                        </p>
                    </div>
                </main>
            </MobileContainer>
        );
    }

    // Fetch programs and user subscriptions
    const { data: programs } = await getPrograms();
    const { data: userPrograms } = await getUserPrograms();

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background">
                <div className="p-6 pb-4">
                    <ServerHeader />

                    <div className="mb-6">
                        <h1 className="font-teko text-6xl uppercase tracking-wider text-accent mb-2">
                            PROGRAM
                        </h1>
                        <p className="font-inter text-primary/80">
                            Följ ett strukturerat träningsprogram.
                        </p>
                    </div>

                    <ProgramList
                        programs={programs || []}
                        userPrograms={userPrograms || []}
                    />
                </div>
            </main>
        </MobileContainer>
    );
}
