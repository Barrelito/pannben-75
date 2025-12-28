/**
 * Squad Dashboard Component
 * Active squad view with member roster
 */

'use client';

import { useState } from 'react';
import type { Squad } from '@/types/database.types';
import type { SquadMember } from '@/hooks/useSquad';
import SquadMemberCard from './SquadMemberCard';

interface SquadDashboardProps {
    squad: Squad;
    members: SquadMember[];
    currentUserId: string;
    onLeaveSquad: (squadId: string) => Promise<void>;
    onRefreshMembers: () => Promise<void>;
    loading: boolean;
}

export default function SquadDashboard({
    squad,
    members,
    currentUserId,
    onLeaveSquad,
    onRefreshMembers,
    loading,
}: SquadDashboardProps) {
    const [copying, setCopying] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const handleCopyCode = async () => {
        if (!squad.invite_code) return;

        try {
            await navigator.clipboard.writeText(squad.invite_code);
            setCopying(true);
            setTimeout(() => setCopying(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleLeave = async () => {
        await onLeaveSquad(squad.id);
        setShowLeaveConfirm(false);
    };

    return (
        <div className="space-y-6">
            {/* Squad Header */}
            <div className="bg-surface border-2 border-accent p-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">⚔️</span>
                    <h1 className="font-teko text-3xl uppercase tracking-wider text-accent">
                        {squad.name}
                    </h1>
                </div>

                {/* Invite Code */}
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <div className="font-inter text-xs uppercase tracking-wider text-primary/60 mb-1">
                            Inbjudningskod
                        </div>
                        <div className="font-mono text-2xl text-primary tracking-widest">
                            {squad.invite_code || 'Ingen kod'}
                        </div>
                    </div>

                    <button
                        onClick={handleCopyCode}
                        className="px-4 py-2 bg-background border-2 border-primary/20 text-primary font-inter text-sm uppercase tracking-wider hover:border-accent hover:text-accent transition-all"
                    >
                        {copying ? '✓ Kopierad!' : '📋 Kopiera'}
                    </button>
                </div>
            </div>

            {/* Member Count & Refresh */}
            <div className="flex items-center justify-between">
                <h2 className="font-teko text-2xl uppercase tracking-wider text-primary">
                    MEDLEMMAR ({members.length})
                </h2>

                <button
                    onClick={onRefreshMembers}
                    disabled={loading}
                    className="px-4 py-2 bg-surface text-primary font-inter text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent transition-all disabled:opacity-50"
                >
                    {loading ? '⟳ Uppdaterar...' : '⟳ Uppdatera'}
                </button>
            </div>

            {/* Member Roster */}
            <div className="space-y-3">
                {members.length === 0 ? (
                    <div className="bg-surface border-2 border-primary/20 p-8 text-center">
                        <p className="font-inter text-primary/60">Inga medlemmar än</p>
                    </div>
                ) : (
                    members.map((member) => (
                        <SquadMemberCard
                            key={member.id}
                            member={member}
                            isCurrentUser={member.user_id === currentUserId}
                        />
                    ))
                )}
            </div>

            {/* Leave Squad */}
            {!showLeaveConfirm ? (
                <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="w-full px-6 py-3 bg-surface text-status-red font-inter font-semibold text-sm uppercase tracking-wider border-2 border-status-red hover:bg-status-red hover:text-background transition-all"
                >
                    LÄMNA PLUTON
                </button>
            ) : (
                <div className="bg-status-red/10 border-2 border-status-red p-4 space-y-3">
                    <p className="font-inter text-sm text-primary text-center">
                        Är du säker? Du kan alltid gå med igen med inbjudningskoden.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowLeaveConfirm(false)}
                            className="flex-1 px-6 py-3 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent transition-all"
                        >
                            Avbryt
                        </button>

                        <button
                            onClick={handleLeave}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-status-red text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-status-red hover:bg-transparent hover:text-status-red transition-all disabled:opacity-50"
                        >
                            {loading ? 'Lämnar...' : 'Bekräfta'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
