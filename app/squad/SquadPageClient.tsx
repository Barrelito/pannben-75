/**
 * Squad Page Client Component
 * Handles routing between create/join and active squad views
 */

'use client';

import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';
import CreateJoinSquad from '@/components/squad/CreateJoinSquad';
import SquadDashboard from '@/components/squad/SquadDashboard';
import { useSquad } from '@/hooks/useSquad';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

interface SquadPageClientProps {
    user: User;
}

export default function SquadPageClient({ user }: SquadPageClientProps) {
    const {
        squad,
        members,
        loading,
        error,
        createSquad,
        joinSquad,
        leaveSquad,
        refreshMembers,
    } = useSquad(user.id);

    return (
        <MobileContainer>
            <main className="min-h-screen bg-background p-6">
                {/* Header */}
                <div className="mb-8">
                    <Logo />
                </div>

                {/* Loading State */}
                {loading && !squad && (
                    <div className="text-center py-12">
                        <div className="font-inter text-primary/60">Laddar...</div>
                    </div>
                )}

                {/* No Squad - Show Create/Join */}
                {!loading && !squad && (
                    <CreateJoinSquad
                        onCreateSquad={createSquad}
                        onJoinSquad={joinSquad}
                        loading={loading}
                        error={error}
                    />
                )}

                {/* Has Squad - Show Dashboard */}
                {squad && (
                    <SquadDashboard
                        squad={squad}
                        members={members}
                        currentUserId={user.id}
                        onLeaveSquad={leaveSquad}
                        onRefreshMembers={refreshMembers}
                        loading={loading}
                    />
                )}

                {/* Back to Dashboard */}
                <Link
                    href="/dashboard"
                    className="block mt-8 text-center font-inter text-sm uppercase tracking-wider text-primary/60 hover:text-accent transition-colors"
                >
                    ← Tillbaka till Dashboard
                </Link>
            </main>
        </MobileContainer>
    );
}
