/**
 * Squad Member Card
 * Displays leaderboard-style member info with rank, XP, and difficulty
 */

'use client';

import type { SquadMember } from '@/hooks/useSquad';
import { getRecoveryColor } from '@/lib/logic/recovery';
import { calculateRank } from '@/lib/gamification';
import { getLevelEmoji, getLevelDisplayName } from '@/lib/gameRules';
import Image from 'next/image';

interface SquadMemberCardProps {
    member: SquadMember;
    isCurrentUser: boolean;
    position?: number; // Leaderboard position (1-indexed)
}

export default function SquadMemberCard({ member, isCurrentUser, position }: SquadMemberCardProps) {
    // Traffic light color
    const statusColor = {
        GREEN: 'bg-status-green',
        YELLOW: 'bg-status-yellow',
        RED: 'bg-status-red',
    }[member.recovery_status];

    // Get initials for fallback
    const getInitials = () => {
        const name = member.display_name || member.username || '?';
        return name.slice(0, 2).toUpperCase();
    };

    // Get rank info
    const rank = calculateRank(member.total_xp);

    // Get difficulty info with colors
    const difficultyColors: Record<string, { text: string; border: string }> = {
        easy: { text: 'text-blue-400', border: 'border-blue-500/30' },
        medium: { text: 'text-yellow-400', border: 'border-yellow-500/30' },
        hard: { text: 'text-red-400', border: 'border-red-500/30' },
    };
    const diffColor = difficultyColors[member.difficulty_level] || difficultyColors.hard;

    return (
        <div
            className={`bg-surface border-2 p-4 ${isCurrentUser ? 'border-accent' : 'border-primary/20'}`}
        >
            <div className="flex items-center gap-4">
                {/* Position Badge (for top 3) */}
                {position && position <= 3 && (
                    <div className="text-2xl">
                        {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
                    </div>
                )}

                {/* Avatar with Status Dot */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                        {member.avatar_url ? (
                            <Image
                                src={member.avatar_url}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <span className="font-teko text-xl text-primary/60">{getInitials()}</span>
                        )}
                    </div>
                    {/* Status Dot */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${statusColor} border-2 border-surface`} />
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                    {/* Name Row */}
                    <div className="font-inter font-semibold text-primary mb-1 flex items-center gap-2 flex-wrap">
                        <span className="truncate">{member.display_name || member.username || 'Anonym'}</span>
                        {/* Rank Badge */}
                        <span className="text-sm" title={rank.name}>{rank.emoji}</span>
                        {member.role === 'admin' && (
                            <span className="text-[10px] px-1 py-0.5 bg-accent/10 border border-accent/20 text-accent uppercase rounded">Admin</span>
                        )}
                        {isCurrentUser && (
                            <span className="text-[10px] px-1 py-0.5 bg-primary/10 border border-primary/20 text-primary uppercase rounded">Du</span>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-xs text-primary/70 flex-wrap">
                        {/* Day */}
                        <span className="font-inter">
                            🔥 Dag {member.current_day}
                        </span>

                        {/* Difficulty Level */}
                        <span className={`font-inter ${diffColor.text}`}>
                            {getLevelEmoji(member.difficulty_level)} {getLevelDisplayName(member.difficulty_level).toUpperCase()}
                        </span>

                        {/* XP */}
                        <span className="font-inter text-accent">
                            ⚡ {member.total_xp} XP
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

