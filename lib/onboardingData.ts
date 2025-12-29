/**
 * Onboarding Data - Level-Specific Content
 * Defines onboarding slides for each difficulty level
 */

import type { DifficultyLevel } from './gameRules';

export interface OnboardingSlide {
    icon: string;
    title: string;
    content: React.ReactNode;
}

// Shared slides used across all levels
const SHARED_SLIDES = {
    water: (liters: string) => ({
        icon: '💧',
        title: 'VATTEN',
        description: `Drick ${liters} vatten per dag.`,
        rules: [
            { icon: '✅', text: 'Ska vara vanligt vatten' },
            { icon: '✅', text: 'Utspritt under dagen' },
            { icon: '❌', text: 'Kaffe, te, lightdryck räknas inte' },
        ],
    }),
    reading: (pages: string, requirement: string) => ({
        icon: '📖',
        title: 'LÄSNING',
        description: `Läs ${pages} varje dag.`,
        rules: [
            { icon: '✅', text: requirement },
            { icon: '✅', text: 'Fysisk bok eller e-bok' },
            { icon: '❌', text: 'Ej ljudbok eller sammanfattningar' },
        ],
    }),
    photo: (required: boolean) => ({
        icon: '📸',
        title: required ? 'PROGRESSBILD' : 'PROGRESSBILD (VALFRITT)',
        description: required
            ? 'Ta en bild på dig själv varje dag.'
            : 'Ta gärna en bild på dig själv (frivilligt).',
        tips: [
            { icon: '💡', text: 'Samma tid på dagen' },
            { icon: '💡', text: 'Liknande ljus & vinkel' },
            { icon: '💡', text: 'Enkel spegelbild räcker' },
        ],
    }),
};

// Level-specific onboarding steps
export const ONBOARDING_STEPS: Record<DifficultyLevel, OnboardingSlide[]> = {
    easy: [
        {
            icon: '🔥',
            title: 'VÄLKOMMEN TILL GNISTAN',
            content: null as any, // Will be rendered as JSX
        },
        {
            icon: '🍽️',
            title: 'DIET',
            content: null as any,
        },
        {
            icon: '🚶',
            title: 'DAGLIG RÖRELSE',
            content: null as any,
        },
        {
            icon: '💧',
            title: 'VATTEN',
            content: null as any,
        },
        {
            icon: '📖',
            title: 'LÄSNING',
            content: null as any,
        },
        {
            icon: '📸',
            title: 'FOTO (VALFRITT)',
            content: null as any,
        },
        {
            icon: '✨',
            title: 'DU HAR DET HÄR!',
            content: null as any,
        },
    ],
    medium: [
        {
            icon: '💪',
            title: 'VÄLKOMMEN TILL GLÖDEN',
            content: null as any,
        },
        {
            icon: '🍽️',
            title: 'DIET',
            content: null as any,
        },
        {
            icon: '🚶',
            title: 'AKTIVITET & PULS',
            content: null as any,
        },
        {
            icon: '💧',
            title: 'VATTEN',
            content: null as any,
        },
        {
            icon: '📖',
            title: 'LÄSNING',
            content: null as any,
        },
        {
            icon: '📸',
            title: 'PROGRESSBILD',
            content: null as any,
        },
        {
            icon: '⚠️',
            title: 'GRUNDREGELN',
            content: null as any,
        },
        {
            icon: '🔥',
            title: 'REDO ATT UTMANA DIG?',
            content: null as any,
        },
    ],
    hard: [
        {
            icon: '⚡',
            title: 'VÄLKOMMEN TILL PANNBEN',
            content: null as any,
        },
        {
            icon: '🍽️',
            title: 'DIET',
            content: null as any,
        },
        {
            icon: '🏃',
            title: 'TRÄNING',
            content: null as any,
        },
        {
            icon: '💧',
            title: 'VATTEN',
            content: null as any,
        },
        {
            icon: '📖',
            title: 'LÄSNING',
            content: null as any,
        },
        {
            icon: '📸',
            title: 'PROGRESSBILD',
            content: null as any,
        },
        {
            icon: '⚠️',
            title: 'GRUNDREGELN',
            content: null as any,
        },
        {
            icon: '⚔️',
            title: 'MÖNSTRING',
            content: null as any,
        },
    ],
};

// Level display info for selector
export const LEVEL_INFO = {
    easy: {
        name: 'GNISTAN',
        emoji: '🔥',
        subtitle: 'För nybörjaren',
        description: 'Börja försiktigt. Bygg vanor utan att överväldigas.',
        highlights: [
            '30 min rörelse/dag',
            '2 liter vatten',
            '5 sidor läsning',
            'Inget godis (vardagar)',
            'Foto valfritt',
        ],
        color: 'blue',
    },
    medium: {
        name: 'GLÖDEN',
        emoji: '💪',
        subtitle: 'Utmanaren',
        description: 'Daglig konsistens + veckans spetsar.',
        highlights: [
            '30 min aktivitet/dag',
            '2 tuffa pass/vecka (45 min)',
            'Clean Eating · Halva tallriken grönt',
            'Ingen alkohol vardagar',
        ],
        color: 'yellow',
    },
    hard: {
        name: 'PANNBEN',
        emoji: '⚡',
        subtitle: 'Eliten',
        description: '75 dagar av total disciplin. Inga ursäkter.',
        highlights: [
            '2 × 45 min träning/dag',
            '1 pass utomhus',
            '4 liter vatten',
            '10 sidor facklitteratur',
            'Nolltolerans för undantag',
        ],
        color: 'red',
    },
};
