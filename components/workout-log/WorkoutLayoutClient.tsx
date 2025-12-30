'use client';

import { useState } from 'react';
import WorkoutBottomNav from '@/components/workout-log/WorkoutBottomNav';
import QuickStartModal from '@/components/workout-log/QuickStartModal';
import type { UserProgram, WorkoutProgram } from '@/types/database.types';

interface WorkoutLayoutClientProps {
    children: React.ReactNode;
    activeProgram?: (UserProgram & { program: WorkoutProgram }) | null;
    runningProgress?: { week: number; session: number } | null;
}

export default function WorkoutLayoutClient({
    children,
    activeProgram,
    runningProgress
}: WorkoutLayoutClientProps) {
    const [showQuickStart, setShowQuickStart] = useState(false);

    return (
        <>
            {children}

            <WorkoutBottomNav
                onQuickStartClick={() => setShowQuickStart(true)}
            />

            <QuickStartModal
                isOpen={showQuickStart}
                onClose={() => setShowQuickStart(false)}
                activeProgram={activeProgram}
                runningProgress={runningProgress}
            />
        </>
    );
}
