/**
 * Create/Join Squad Component
 * Onboarding view when user has no squad
 */

'use client';

import { useState } from 'react';

interface CreateJoinSquadProps {
    onCreateSquad: (name: string) => Promise<void>;
    onJoinSquad: (code: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export default function CreateJoinSquad({
    onCreateSquad,
    onJoinSquad,
    loading,
    error,
}: CreateJoinSquadProps) {
    const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
    const [squadName, setSquadName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const handleCreate = async () => {
        if (!squadName.trim()) return;
        await onCreateSquad(squadName.trim());
    };

    const handleJoin = async () => {
        if (!inviteCode.trim()) return;
        await onJoinSquad(inviteCode.trim().toUpperCase());
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="text-6xl mb-4">⚔️</div>
                <h1 className="font-teko text-4xl uppercase tracking-wider text-accent">
                    PLUTONEN
                </h1>
                <p className="font-inter text-primary/80 mt-2">
                    Hitta din trupp
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-status-red/10 border-2 border-status-red p-4 text-center">
                    <p className="font-inter text-sm text-primary">{error}</p>
                </div>
            )}

            {/* Create Squad */}
            <div className="bg-surface border-2 border-primary/20 p-6">
                <h2 className="font-inter text-sm uppercase tracking-wider text-primary/60 mb-4">
                    SKAPA NY PLUTON
                </h2>

                {mode === 'create' || mode === 'idle' ? (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={squadName}
                            onChange={(e) => setSquadName(e.target.value)}
                            onFocus={() => setMode('create')}
                            placeholder="t.ex. Spartaner"
                            maxLength={50}
                            className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none"
                        />

                        <button
                            onClick={handleCreate}
                            disabled={loading || !squadName.trim()}
                            className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'SKAPAR...' : 'SKAPA'}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setMode('create')}
                        className="w-full px-6 py-3 bg-surface text-primary font-inter text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent transition-all"
                    >
                        Välj detta alternativ
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-primary/20" />
                <span className="font-inter text-sm uppercase tracking-wider text-primary/60">
                    ELLER
                </span>
                <div className="flex-1 h-px bg-primary/20" />
            </div>

            {/* Join Squad */}
            <div className="bg-surface border-2 border-primary/20 p-6">
                <h2 className="font-inter text-sm uppercase tracking-wider text-primary/60 mb-4">
                    GÅ MED I PLUTON
                </h2>

                {mode === 'join' || mode === 'idle' ? (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            onFocus={() => setMode('join')}
                            placeholder="XXXX-XX"
                            maxLength={7}
                            className="w-full px-4 py-3 bg-background border-2 border-primary/20 text-primary font-inter font-mono text-center text-2xl tracking-widest focus:border-accent focus:outline-none uppercase"
                        />

                        <button
                            onClick={handleJoin}
                            disabled={loading || !inviteCode.trim()}
                            className="w-full px-8 py-4 bg-surface text-primary font-inter font-semibold text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'GÅR MED...' : 'GÅ MED'}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setMode('join')}
                        className="w-full px-6 py-3 bg-surface text-primary font-inter text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent transition-all"
                    >
                        Välj detta alternativ
                    </button>
                )}
            </div>
        </div>
    );
}
