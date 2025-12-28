/**
 * Squad Member Card
 * Displays individual member status in roster
 */

'use client';

import type { SquadMember } from '@/hooks/useSquad';
import { getRecoveryColor } from '@/lib/logic/recovery';
import Image from 'next/image';

interface SquadMemberCardProps {
    member: SquadMember;
    isCurrentUser: boolean;
}

export default function SquadMemberCard({ member, isCurrentUser }: SquadMemberCardProps) {
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

    // Workout indicators
    const renderWorkoutStatus = () => {
        const { workout_outdoor_completed, workout_indoor_completed } = member;

        // If no log exists for today, both are null
        const outdoor = workout_outdoor_completed === true ? '✓' : '○';
        const indoor = workout_indoor_completed === true ? '✓' : '○';

        return (
            <span className="font-inter text-2xl tracking-wider">
                {outdoor}{indoor}
            </span>
        );
    };

    return (
        <div
            className={`bg-surface border-2 p-4 ${isCurrentUser ? 'border-accent' : 'border-primary/20'
                }`}
        >
            <div className="flex items-center gap-4">
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
                <div className="flex-1">
                    <div className="font-inter font-semibold text-primary mb-1 flex items-center gap-2">
                        {member.display_name || member.username || 'Anonym'}
                        {member.role === 'admin' && (
                            <span className="text-[10px] px-1 py-0.5 bg-accent/10 border border-accent/20 text-accent uppercase rounded">Admin</span>
                        )}
                        {isCurrentUser && (
                            <span className="text-[10px] px-1 py-0.5 bg-primary/10 border border-primary/20 text-primary uppercase rounded">Du</span>
                        )}
                    </div>

                    {/* Motto (if exists) */}
                    {member.motto && (
                        <div className="text-xs text-primary/60 italic mb-1">"{member.motto}"</div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-primary/80">
                        {/* Streak */}
                        <span className="font-inter">
                            🔥 Dag {member.current_day}
                        </span>

                        {/* Workout Status */}
                        {renderWorkoutStatus()}
                    </div>
                </div>
            </div>
        </div>
    );
}
