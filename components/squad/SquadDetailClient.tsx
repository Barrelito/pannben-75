/**
 * Squad Detail Client
 * Shows roster and details for a specific squad
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSquad } from '@/hooks/useSquad';
import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';
import SquadMemberCard from '@/components/squad/SquadMemberCard';
import SquadFeed from '@/components/squad/SquadFeed';
import type { User } from '@supabase/supabase-js';

interface SquadDetailClientProps {
    user: User;
    squadId: string;
}

export default function SquadDetailClient({ user, squadId }: SquadDetailClientProps) {
    const router = useRouter();
    const {
        squads,
        squad,
        members,
        loading,
        selectSquad,
        fetchMySquads,
        refreshMembers,
        leaveSquad
    } = useSquad(user.id);

    const [notFound, setNotFound] = useState(false);

    // Initialize: Ensure we have the squad selected
    useEffect(() => {
        if (loading) return;

        const targetSquad = squads.find(s => s.id === squadId);

        if (targetSquad) {
            if (squad?.id !== targetSquad.id) {
                selectSquad(targetSquad);
            }
        } else if (squads.length > 0) {
            // We loaded squads but this one isn't there -> Not a member
            setNotFound(true);
        }
    }, [squads, squadId, loading, selectSquad, squad?.id]);

    // Fetch members when squad is selected
    useEffect(() => {
        if (squad?.id === squadId) {
            refreshMembers();
        }
    }, [squad?.id, squadId, refreshMembers]);

    const handleLeave = async () => {
        if (confirm('Är du säker på att du vill lämna plutonen?')) {
            await leaveSquad(squadId);
            router.push('/squad');
        }
    };

    if (loading) {
        return (
            <MobileContainer>
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-primary font-inter">Laddar pluton...</div>
                </div>
            </MobileContainer>
        );
    }

    if (notFound) {
        return (
            <MobileContainer>
                <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
                    <div className="text-4xl mb-4">🚫</div>
                    <h1 className="font-teko text-3xl uppercase text-primary mb-2">Pluton hittades inte</h1>
                    <p className="font-inter text-sm text-primary/60 mb-6">
                        Du är inte medlem i denna pluton eller så finns den inte.
                    </p>
                    <button
                        onClick={() => router.push('/squad')}
                        className="px-8 py-3 bg-accent text-background font-inter font-bold uppercase tracking-wider"
                    >
                        Tillbaka till lobbyn
                    </button>
                </div>
            </MobileContainer>
        );
    }

    if (!squad) return null;

    return (
        <MobileContainer>
            <div className="min-h-screen bg-background pb-20 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Logo />
                    <button onClick={() => router.push('/squad')} className="text-primary/60 hover:text-accent">
                        TILL LOBBYN
                    </button>
                </div>

                {/* Squad Info */}
                <div className="mb-8 border-b-2 border-primary/20 pb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="font-teko text-5xl uppercase tracking-wider text-accent mb-2">
                                {squad.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-inter text-sm text-primary/60">INBJUDNINGSKOD:</span>
                                    <code className="px-3 py-1 bg-surface border border-primary/20 text-accent font-mono text-lg tracking-widest">
                                        {squad.invite_code}
                                    </code>
                                </div>
                                <button
                                    onClick={async () => {
                                        const shareData = {
                                            title: 'Gå med i min Pluton',
                                            text: `Häng med i min pluton "${squad.name}" på Pannben75! ⚔️\nAnvänd kod: ${squad.invite_code}`,
                                            url: window.location.origin + '/squad'
                                        };

                                        if (navigator.share) {
                                            try {
                                                await navigator.share(shareData);
                                            } catch (err) {
                                                console.error('Error sharing:', err);
                                            }
                                        } else {
                                            await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                                            alert('Inbjudan kopierad till urklipp! 📋');
                                        }
                                    }}
                                    className="p-2 bg-surface text-primary border border-primary/20 hover:border-accent hover:text-accent transition-all"
                                    title="Dela inbjudan"
                                >
                                    📤 DELA
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="font-inter text-primary/80">
                        {members.length} soldater i ledet. Håll disciplinen.
                    </p>
                </div>

                {/* Roster */}
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-teko text-2xl uppercase text-primary">Truppen</h2>
                        <button onClick={() => refreshMembers()} className="text-xs text-primary/60 hover:text-accent">
                            UPPDATERA
                        </button>
                    </div>

                    {members.map((member) => (
                        <SquadMemberCard
                            key={member.id}
                            member={member}
                            isCurrentUser={member.user_id === user.id}
                        />
                    ))}
                </div>

                {/* Social Feed */}
                <SquadFeed squadId={squadId} userId={user.id} />

                {/* Actions */}
                <div className="border-t-2 border-primary/20 pt-8">
                    <button
                        onClick={handleLeave}
                        className="w-full py-4 text-status-red hover:text-red-400 font-inter font-bold text-sm uppercase tracking-wider border-2 border-status-red/20 hover:border-status-red transition-all"
                    >
                        LÄMNA PLUTON
                    </button>
                </div>
            </div>
        </MobileContainer>
    );
}
