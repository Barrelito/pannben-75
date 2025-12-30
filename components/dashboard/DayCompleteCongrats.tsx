'use client';

import { useState, useEffect } from 'react';

const CONGRATS_MESSAGES = [
    { emoji: '💪', text: 'Du har ägt dagen!' },
    { emoji: '🏆', text: 'Alla checkar klara – imponerande!' },
    { emoji: '🔥', text: 'Bra jobbat – dagen är din!' },
    { emoji: '⚡', text: 'Du är unstoppable!' },
    { emoji: '🎯', text: 'Målmedveten som fan!' },
    { emoji: '👊', text: 'En dag till handlingarna!' },
];

interface DayCompleteCongratsProps {
    onPlanTomorrow: () => void;
    onSkip: () => void;
}

export default function DayCompleteCongrats({
    onPlanTomorrow,
    onSkip,
}: DayCompleteCongratsProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [message] = useState(() =>
        CONGRATS_MESSAGES[Math.floor(Math.random() * CONGRATS_MESSAGES.length)]
    );

    useEffect(() => {
        // Trigger fade-in animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background opacity-80" />

            {/* Content */}
            <div className="relative z-10 px-8 max-w-lg text-center space-y-10">

                {/* Congrats Header */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-7xl animate-bounce">{message.emoji}</span>
                    <h2 className="font-teko text-4xl md:text-5xl uppercase tracking-widest text-accent">
                        {message.text}
                    </h2>
                </div>

                {/* NightWatch Prompt */}
                <div className="space-y-3">
                    <p className="font-inter text-primary/80 text-lg">
                        Planera idag för att äga morgondagen
                    </p>
                    <p className="font-inter text-primary/50 text-sm">
                        Sätt upp din plan för morgondagens träning och kost
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-4">
                    {/* Plan Tomorrow Button */}
                    <button
                        onClick={onPlanTomorrow}
                        className="w-full py-5 bg-accent text-background font-inter font-bold text-lg uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all rounded-lg"
                    >
                        🌙 PLANERA MORGONDAGEN
                    </button>

                    {/* Skip Button */}
                    <button
                        onClick={onSkip}
                        className="w-full py-4 bg-surface text-primary/60 font-inter text-sm uppercase tracking-wider border-2 border-primary/20 hover:border-accent hover:text-accent transition-all rounded-lg"
                    >
                        ↩️ NEJ TACK, AVSLUTA DAGEN
                    </button>
                </div>
            </div>
        </div>
    );
}
