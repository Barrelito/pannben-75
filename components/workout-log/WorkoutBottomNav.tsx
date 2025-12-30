'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface WorkoutBottomNavProps {
    onQuickStartClick: () => void;
}

export default function WorkoutBottomNav({ onQuickStartClick }: WorkoutBottomNavProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/workout') {
            return pathname === '/workout';
        }
        return pathname.startsWith(path);
    };

    const navItems = [
        { href: '/workout', icon: '🏠', label: 'Hem' },
        { href: '/workout/stats', icon: '📊', label: 'Statistik' },
        { href: '#', icon: '➕', label: 'Start', isAction: true },
        { href: '/workout/programs', icon: '📋', label: 'Program' },
        { href: '/workout/settings', icon: '⚙️', label: 'Inställningar' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-primary/20 z-50">
            <div className="max-w-md mx-auto flex justify-around items-center h-16">
                {navItems.map((item) => {
                    if (item.isAction) {
                        return (
                            <button
                                key={item.label}
                                onClick={onQuickStartClick}
                                className="flex flex-col items-center justify-center w-14 h-14 -mt-6 bg-accent rounded-full border-4 border-background shadow-lg"
                            >
                                <span className="text-2xl text-background">{item.icon}</span>
                            </button>
                        );
                    }

                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center px-3 py-2 ${active ? 'text-accent' : 'text-primary/60'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-inter mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
