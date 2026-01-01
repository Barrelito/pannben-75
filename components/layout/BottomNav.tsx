'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, BarChart2, Plus, Settings, X, Play, Edit3 } from 'lucide-react';
import QuickLogModal from '@/components/workout/QuickLogModal';

export default function BottomNav() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showQuickLog, setShowQuickLog] = useState(false);

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(path);
    };

    // Hide on landing page and onboarding
    if (pathname === '/' || pathname.startsWith('/onboarding') || pathname.startsWith('/login') || pathname.startsWith('/join')) {
        return null;
    }

    return (
        <>
            {/* Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-primary/20 z-50 safe-area-bottom">
                <div className="max-w-md mx-auto flex justify-between items-center h-20 px-6">
                    {/* Home */}
                    <Link
                        href="/dashboard"
                        className={`flex flex-col items-center justify-center space-y-1 transition-colors ${isActive('/dashboard') ? 'text-accent' : 'text-primary/40 hover:text-primary'
                            }`}
                    >
                        <Home size={24} strokeWidth={1.5} />
                        <span className="text-[10px] uppercase tracking-wider font-inter">Hem</span>
                    </Link>

                    {/* Stats */}
                    <Link
                        href="/statistics"
                        className={`flex flex-col items-center justify-center space-y-1 transition-colors ${isActive('/statistics') ? 'text-accent' : 'text-primary/40 hover:text-primary'
                            }`}
                    >
                        <BarChart2 size={24} strokeWidth={1.5} />
                        <span className="text-[10px] uppercase tracking-wider font-inter">Statistik</span>
                    </Link>

                    {/* Plus Button (Center) */}
                    <div className="relative -top-5">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`flex items-center justify-center w-14 h-14 rounded-full border-2 shadow-lg transition-all ${isMenuOpen
                                ? 'bg-background border-accent text-accent rotate-45' // Active/Open state
                                : 'bg-accent border-accent text-background hover:bg-white hover:text-accent' // Default state
                                }`}
                        >
                            <Plus size={28} strokeWidth={2} />
                        </button>
                    </div>

                    {/* Program (Keeping 4th slot? User list had 4 items including +. 
                       "Hem", "Statistik", "+", "Inställningar". 
                       If I put + in the middle of 4 items, it's: [Hem] [Stats] [+] [Settings]. 
                       Wait, 3 items + 1 button? No, let's look at the spacing.
                       If we have 3 buttons + Plus, that's 4 points.
                       Left: Home, Stats. Right: Settings. That's unbalanced.
                       
                       User said: "Hem", "Statistik", "+", "Inställningar".
                       That is strictly 3 nav items and 1 action button.
                       Layout: [Hem] [Statistik] ... [+] ... [Inställningar]
                       Or [Hem] ... [Statistik] ... [+] ... [Inställningar] -> No, that's 4 items.
                       Let's go with balanced spacing.
                    */}

                    {/* Settings */}
                    <Link
                        href="/workout/settings"
                        className={`flex flex-col items-center justify-center space-y-1 transition-colors ${isActive('/workout/settings') ? 'text-accent' : 'text-primary/40 hover:text-primary'
                            }`}
                    >
                        <Settings size={24} strokeWidth={1.5} />
                        <span className="text-[10px] uppercase tracking-wider font-inter">Inställningar</span>
                    </Link>
                </div>
            </nav>

            {/* Quick Action Menu (Popover) */}
            {isMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Menu Content */}
                    <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-4 px-6 animate-in slide-in-from-bottom-5 fade-in duration-200">
                        {/* Start Next Session */}
                        <Link
                            href="/workout"
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-surface w-full max-w-sm p-4 border border-primary/20 flex items-center gap-4 hover:border-accent transition-colors group"
                        >
                            <div className="p-3 bg-accent/10 text-accent rounded-full group-hover:bg-accent group-hover:text-background transition-colors">
                                <Play size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="font-teko text-lg text-primary uppercase tracking-wider">Starta nästa pass</h3>
                                <p className="font-inter text-xs text-primary/60">Gå till ditt aktiva program</p>
                            </div>
                        </Link>

                        {/* Log Quick Workout */}
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                setShowQuickLog(true);
                            }}
                            className="bg-surface w-full max-w-sm p-4 border border-primary/20 flex items-center gap-4 hover:border-accent transition-colors group text-left"
                        >
                            <div className="p-3 bg-accent/10 text-accent rounded-full group-hover:bg-accent group-hover:text-background transition-colors">
                                <Edit3 size={24} />
                            </div>
                            <div>
                                <h3 className="font-teko text-lg text-primary uppercase tracking-wider">Logga annan träning</h3>
                                <p className="font-inter text-xs text-primary/60">Snabblogga pass utanför programmet</p>
                            </div>
                        </button>
                    </div>
                </>
            )}

            {/* Quick Log Modal */}
            <QuickLogModal
                isOpen={showQuickLog}
                onClose={() => setShowQuickLog(false)}
            />
        </>
    );
}
