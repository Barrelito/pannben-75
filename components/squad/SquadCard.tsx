/**
 * Squad Card
 * Displays a summary of a squad in the lobby
 */

'use client';

import type { Squad } from '@/types/database.types';

interface SquadCardProps {
    squad: Squad;
    onClick: () => void;
}

export default function SquadCard({ squad, onClick }: SquadCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-surface border-2 border-primary/20 p-6 hover:border-accent hover:bg-surface/80 transition-all group relative overflow-hidden"
        >
            {/* Hover Indicator */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-teko text-3xl uppercase tracking-wider text-primary group-hover:text-accent transition-colors">
                        {squad.name}
                    </h3>
                    <p className="font-inter text-xs text-primary/60 mt-1">
                        KOD: <span className="font-mono">{squad.invite_code}</span>
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-accent">
                    ⚔️
                </div>
            </div>

            <div className="flex items-center gap-2 text-primary/60 text-sm font-inter">
                <span>KLICKA FÖR ATT GÅ IN</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
        </button>
    );
}
