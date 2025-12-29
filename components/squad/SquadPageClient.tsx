/**
 * Squad Lobby Client
 * Shows list of squads and actions to create/join
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSquad } from '@/hooks/useSquad';
import MobileContainer from '@/components/layout/MobileContainer';
import Header from '@/components/layout/Header';
import SquadCard from '@/components/squad/SquadCard';
import CreateSquadModal from '@/components/squad/CreateSquadModal';
import JoinSquadModal from '@/components/squad/JoinSquadModal';
import type { User } from '@supabase/supabase-js';

export default function SquadPageClient({ user }: { user: User }) {
    const router = useRouter();
    const {
        squads,
        loading,
        createSquad,
        joinSquad,
        selectSquad
    } = useSquad(user.id);

    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    const handleCreate = async (name: string) => {
        await createSquad(name);
        setShowCreate(false);
        router.push(`/squad/${squads[squads.length - 1]?.id || ''}`); // Navigate to new squad (optimistic)
    };

    const handleJoin = async (code: string) => {
        try {
            const squadId = await joinSquad(code);
            setShowJoin(false);
            if (squadId) {
                router.push(`/squad/${squadId}`);
            }
        } catch (err) {
            // Error is handled in hook/displayed in modal if we wanted, 
            // but for now main error state is in hook. 
            // We could add local error state here if needed.
        }
    };

    const handleSquadClick = (squad: any) => {
        selectSquad(squad);
        router.push(`/squad/${squad.id}`);
    };

    return (
        <MobileContainer>
            <div className="min-h-screen bg-background pb-20 p-6">
                {/* Header */}
                <Header />

                <div className="mb-8">
                    <h1 className="font-teko text-5xl uppercase tracking-wider text-accent mb-2">
                        MINA PLUTONER
                    </h1>
                    <p className="font-inter text-primary/80">
                        Här samlar du dina trupper. Gå med i flera, men glöm aldrig disciplinen.
                    </p>
                </div>

                {/* Utils */}
                <CreateSquadModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    onSubmit={handleCreate}
                />

                <JoinSquadModal
                    isOpen={showJoin}
                    onClose={() => setShowJoin(false)}
                    onSubmit={handleJoin}
                />

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-4 bg-accent text-background font-inter font-bold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                    >
                        SKAPA NY
                    </button>
                    <button
                        onClick={() => setShowJoin(true)}
                        className="px-4 py-4 bg-surface text-primary font-inter font-bold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all"
                    >
                        GÅ MED
                    </button>
                </div>

                {/* List */}
                {loading ? (
                    <div className="text-center text-primary/60 font-inter py-10">Laddar plutoner...</div>
                ) : squads.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-primary/10">
                        <div className="text-4xl mb-4">🛡️</div>
                        <p className="font-inter text-primary/60">
                            Du är inte med i någon pluton än.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {squads.map((squad) => (
                            <SquadCard
                                key={squad.id}
                                squad={squad}
                                onClick={() => handleSquadClick(squad)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </MobileContainer>
    );
}
