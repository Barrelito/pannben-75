/**
 * Running Program Data - Couch to 5K (9 Weeks)
 * All sessions are 45 minutes: 5min warmup + 35min work + 5min cooldown
 */

export interface Interval {
    type: 'WALK' | 'RUN' | 'WARMUP' | 'COOLDOWN';
    durationSeconds: number;
    voiceCue: string;
}

export interface Session {
    id: string;
    weekNumber: number;
    sessionNumber: number;
    title: string;
    totalMinutes: number;
    summary: string[];
    intervals: Interval[];
}

export interface Week {
    weekNumber: number;
    theme: string;
    sessions: Session[];
}

// Helper function to create warmup/cooldown
const WARMUP: Interval = { type: 'WARMUP', durationSeconds: 300, voiceCue: 'Börja gå. Fem minuters uppvärmning.' };
const COOLDOWN: Interval = { type: 'COOLDOWN', durationSeconds: 300, voiceCue: 'Bra jobbat! Fem minuters nedvarvning.' };

// Week 1: Run 1min / Walk 2.5min (x10)
const WEEK_1_INTERVALS: Interval[] = [
    WARMUP,
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Spring nu! En minut.' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå. Vila i två och en halv minut.' },
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 60, voiceCue: 'Sista rundan! Spring!' },
    { type: 'WALK', durationSeconds: 150, voiceCue: 'Gå.' },
    COOLDOWN,
];

// Week 2: Run 1.5min / Walk 2min (x10)
const WEEK_2_INTERVALS: Interval[] = [
    WARMUP,
    ...Array(10).fill(null).flatMap((_, i) => [
        { type: 'RUN', durationSeconds: 90, voiceCue: i === 0 ? 'Spring nu! Nittio sekunder.' : (i === 9 ? 'Sista rundan! Spring!' : 'Spring!') },
        { type: 'WALK', durationSeconds: 120, voiceCue: 'Gå.' },
    ]),
    COOLDOWN,
];

// Week 3: Run 2min / Walk 1.5min (x10)
const WEEK_3_INTERVALS: Interval[] = [
    WARMUP,
    ...Array(10).fill(null).flatMap((_, i) => [
        { type: 'RUN', durationSeconds: 120, voiceCue: i === 0 ? 'Spring nu! Två minuter.' : (i === 9 ? 'Sista rundan! Spring!' : 'Spring!') },
        { type: 'WALK', durationSeconds: 90, voiceCue: 'Gå.' },
    ]),
    COOLDOWN,
];

// Week 4: Run 3min / Walk 2min (x7)
const WEEK_4_INTERVALS: Interval[] = [
    WARMUP,
    ...Array(7).fill(null).flatMap((_, i) => [
        { type: 'RUN', durationSeconds: 180, voiceCue: i === 0 ? 'Spring nu! Tre minuter.' : (i === 6 ? 'Sista rundan! Spring!' : 'Spring!') },
        { type: 'WALK', durationSeconds: 120, voiceCue: 'Gå.' },
    ]),
    COOLDOWN,
];

// Week 5: Run 5min / Walk 3min (x4) + Run 3min
const WEEK_5_INTERVALS: Interval[] = [
    WARMUP,
    { type: 'RUN', durationSeconds: 300, voiceCue: 'Spring nu! Fem minuter.' },
    { type: 'WALK', durationSeconds: 180, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 300, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 180, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 300, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 180, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 300, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 180, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 180, voiceCue: 'Sista rundan! Tre minuter.' },
    COOLDOWN,
];

// Week 6: Run 8min / Walk 3min (x3) + Run 2min
const WEEK_6_INTERVALS: Interval[] = [
    WARMUP,
    { type: 'RUN', durationSeconds: 480, voiceCue: 'Spring nu! Åtta minuter.' },
    { type: 'WALK', durationSeconds: 180, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 480, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 180, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 480, voiceCue: 'Spring!' },
    { type: 'WALK', durationSeconds: 180, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 120, voiceCue: 'Sista rundan! Två minuter.' },
    COOLDOWN,
];

// Week 7: Run 15min / Walk 3min (x2) + Run 6min
const WEEK_7_INTERVALS: Interval[] = [
    WARMUP,
    { type: 'RUN', durationSeconds: 900, voiceCue: 'Spring nu! Femton minuter.' },
    { type: 'WALK', durationSeconds: 180, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 900, voiceCue: 'Spring! Femton minuter.' },
    { type: 'WALK', durationSeconds: 180, voiceCue: 'Gå.' },
    { type: 'RUN', durationSeconds: 360, voiceCue: 'Sista rundan! Sex minuter.' },
    COOLDOWN,
];

// Week 8: Run 20min / Walk 5min / Run 10min
const WEEK_8_INTERVALS: Interval[] = [
    WARMUP,
    { type: 'RUN', durationSeconds: 1200, voiceCue: 'Spring nu! Tjugo minuter.' },
    { type: 'WALK', durationSeconds: 300, voiceCue: 'Gå. Fem minuter.' },
    { type: 'RUN', durationSeconds: 600, voiceCue: 'Sista rundan! Tio minuter.' },
    COOLDOWN,
];

// Week 9: Run 35min continuous (THE GOAL!)
const WEEK_9_INTERVALS: Interval[] = [
    WARMUP,
    { type: 'RUN', durationSeconds: 2100, voiceCue: 'Nu kör vi! Trettio fem minuter kontinuerlig löpning. DU KLARAR DETTA!' },
    COOLDOWN,
];

export const RUNNING_PROGRAM: Week[] = [
    {
        weekNumber: 1,
        theme: 'Första stegen',
        sessions: [
            {
                id: 'w1s1',
                weekNumber: 1,
                sessionNumber: 1,
                title: 'Vecka 1 - Pass 1',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '10x (1 min Löpning / 2.5 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_1_INTERVALS,
            },
            {
                id: 'w1s2',
                weekNumber: 1,
                sessionNumber: 2,
                title: 'Vecka 1 - Pass 2',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '10x (1 min Löpning / 2.5 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_1_INTERVALS,
            },
            {
                id: 'w1s3',
                weekNumber: 1,
                sessionNumber: 3,
                title: 'Vecka 1 - Pass 3',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '10x (1 min Löpning / 2.5 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_1_INTERVALS,
            },
        ],
    },
    {
        weekNumber: 2,
        theme: 'Bygga uthållighet',
        sessions: [
            {
                id: 'w2s1',
                weekNumber: 2,
                sessionNumber: 1,
                title: 'Vecka 2 - Pass 1',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '10x (1.5 min Löpning / 2 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_2_INTERVALS,
            },
            {
                id: 'w2s2',
                weekNumber: 2,
                sessionNumber: 2,
                title: 'Vecka 2 - Pass 2',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '10x (1.5 min Löpning / 2 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_2_INTERVALS,
            },
            {
                id: 'w2s3',
                weekNumber: 2,
                sessionNumber: 3,
                title: 'Vecka 2 - Pass 3',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '10x (1.5 min Löpning / 2 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_2_INTERVALS,
            },
        ],
    },
    {
        weekNumber: 3,
        theme: 'Ökande intensitet',
        sessions: [
            {
                id: 'w3s1',
                weekNumber: 3,
                sessionNumber: 1,
                title: 'Vecka 3 - Pass 1',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '10x (2 min Löpning / 1.5 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_3_INTERVALS,
            },
            {
                id: 'w3s2',
                weekNumber: 3,
                sessionNumber: 2,
                title: 'Vecka 3 - Pass 2',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '10x (2 min Löpning / 1.5 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_3_INTERVALS,
            },
            {
                id: 'w3s3',
                weekNumber: 3,
                sessionNumber: 3,
                title: 'Vecka 3 - Pass 3',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '10x (2 min Löpning / 1.5 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_3_INTERVALS,
            },
        ],
    },
    {
        weekNumber: 4,
        theme: 'Längre intervaller',
        sessions: [
            {
                id: 'w4s1',
                weekNumber: 4,
                sessionNumber: 1,
                title: 'Vecka 4 - Pass 1',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '7x (3 min Löpning / 2 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_4_INTERVALS,
            },
            {
                id: 'w4s2',
                weekNumber: 4,
                sessionNumber: 2,
                title: 'Vecka 4 - Pass 2',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '7x (3 min Löpning / 2 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_4_INTERVALS,
            },
            {
                id: 'w4s3',
                weekNumber: 4,
                sessionNumber: 3,
                title: 'Vecka 4 - Pass 3',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '7x (3 min Löpning / 2 min Gång)', '5 min Nedvarvning'],
                intervals: WEEK_4_INTERVALS,
            },
        ],
    },
    {
        weekNumber: 5,
        theme: 'Fem-minuters ruller',
        sessions: [
            {
                id: 'w5s1',
                weekNumber: 5,
                sessionNumber: 1,
                title: 'Vecka 5 - Pass 1',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '4x (5 min Löpning / 3 min Gång) + 3 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_5_INTERVALS,
            },
            {
                id: 'w5s2',
                weekNumber: 5,
                sessionNumber: 2,
                title: 'Vecka 5 - Pass 2',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '4x (5 min Löpning / 3 min Gång) + 3 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_5_INTERVALS,
            },
            {
                id: 'w5s3',
                weekNumber: 5,
                sessionNumber: 3,
                title: 'Vecka 5 - Pass 3',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '4x (5 min Löpning / 3 min Gång) + 3 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_5_INTERVALS,
            },
        ],
    },
    {
        weekNumber: 6,
        theme: 'Åtta-minuters block',
        sessions: [
            {
                id: 'w6s1',
                weekNumber: 6,
                sessionNumber: 1,
                title: 'Vecka 6 - Pass 1',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '3x (8 min Löpning / 3 min Gång) + 2 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_6_INTERVALS,
            },
            {
                id: 'w6s2',
                weekNumber: 6,
                sessionNumber: 2,
                title: 'Vecka 6 - Pass 2',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '3x (8 min Löpning / 3 min Gång) + 2 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_6_INTERVALS,
            },
            {
                id: 'w6s3',
                weekNumber: 6,
                sessionNumber: 3,
                title: 'Vecka 6 - Pass 3',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '3x (8 min Löpning / 3 min Gång) + 2 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_6_INTERVALS,
            },
        ],
    },
    {
        weekNumber: 7,
        theme: 'Femton-minuters passes',
        sessions: [
            {
                id: 'w7s1',
                weekNumber: 7,
                sessionNumber: 1,
                title: 'Vecka 7 - Pass 1',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '2x (15 min Löpning / 3 min Gång) + 6 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_7_INTERVALS,
            },
            {
                id: 'w7s2',
                weekNumber: 7,
                sessionNumber: 2,
                title: 'Vecka 7 - Pass 2',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '2x (15 min Löpning / 3 min Gång) + 6 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_7_INTERVALS,
            },
            {
                id: 'w7s3',
                weekNumber: 7,
                sessionNumber: 3,
                title: 'Vecka 7 - Pass 3',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '2x (15 min Löpning / 3 min Gång) + 6 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_7_INTERVALS,
            },
        ],
    },
    {
        weekNumber: 8,
        theme: 'Nästan där',
        sessions: [
            {
                id: 'w8s1',
                weekNumber: 8,
                sessionNumber: 1,
                title: 'Vecka 8 - Pass 1',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '20 min Löpning / 5 min Gång / 10 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_8_INTERVALS,
            },
            {
                id: 'w8s2',
                weekNumber: 8,
                sessionNumber: 2,
                title: 'Vecka 8 - Pass 2',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '20 min Löpning / 5 min Gång / 10 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_8_INTERVALS,
            },
            {
                id: 'w8s3',
                weekNumber: 8,
                sessionNumber: 3,
                title: 'Vecka 8 - Pass 3',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '20 min Löpning / 5 min Gång / 10 min Löpning', '5 min Nedvarvning'],
                intervals: WEEK_8_INTERVALS,
            },
        ],
    },
    {
        weekNumber: 9,
        theme: 'MÅLET - Kontinuerlig löpning',
        sessions: [
            {
                id: 'w9s1',
                weekNumber: 9,
                sessionNumber: 1,
                title: 'Vecka 9 - Pass 1 (MÅLET)',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '35 min Kontinuerlig Löpning', '5 min Nedvarvning'],
                intervals: WEEK_9_INTERVALS,
            },
            {
                id: 'w9s2',
                weekNumber: 9,
                sessionNumber: 2,
                title: 'Vecka 9 - Pass 2 (MÅLET)',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '35 min Kontinuerlig Löpning', '5 min Nedvarvning'],
                intervals: WEEK_9_INTERVALS,
            },
            {
                id: 'w9s3',
                weekNumber: 9,
                sessionNumber: 3,
                title: 'Vecka 9 - Pass 3 (MÅLET)',
                totalMinutes: 45,
                summary: ['5 min Uppvärmning', '35 min Kontinuerlig Löpning', '5 min Nedvarvning'],
                intervals: WEEK_9_INTERVALS,
            },
        ],
    },
];

export function getSession(id: string): Session | undefined {
    for (const week of RUNNING_PROGRAM) {
        const session = week.sessions.find(s => s.id === id);
        if (session) return session;
    }
    return undefined;
}

export function getWeek(weekNumber: number): Week | undefined {
    return RUNNING_PROGRAM.find(w => w.weekNumber === weekNumber);
}
