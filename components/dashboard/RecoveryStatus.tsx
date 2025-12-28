/**
 * Recovery Status Card
 * Displays the traffic light status (GREEN/YELLOW/RED) with message
 */

'use client';

import type { RecoveryStatus } from '@/types/logic.types';
import { getRecoveryColor, getRecoveryEmoji } from '@/lib/logic/recovery';

interface RecoveryStatusProps {
    status: RecoveryStatus;
    message: string;
    totalScore: number;
}

export default function RecoveryStatusCard({
    status,
    message,
    totalScore,
}: RecoveryStatusProps) {
    const colorClass = {
        GREEN: 'bg-status-green',
        YELLOW: 'bg-status-yellow',
        RED: 'bg-status-red',
    }[status];

    const statusText = {
        GREEN: 'GRÖN',
        YELLOW: 'GUL',
        RED: 'RÖD',
    }[status];

    const emoji = getRecoveryEmoji(status);

    return (
        <div className={`${colorClass} p-6 border-2 border-primary/20`}>
            {/* Status Header */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{emoji}</span>
                <h2 className="font-teko text-3xl uppercase tracking-wider text-primary">
                    {statusText}
                </h2>
            </div>

            {/* Message */}
            <p className="font-inter text-lg text-primary mb-4">{message}</p>

            {/* Score */}
            <div className="font-inter text-sm text-primary/80">
                Total Poäng: <span className="font-semibold">{totalScore}/10</span>
            </div>
        </div>
    );
}
