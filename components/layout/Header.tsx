/**
 * Unified App Header
 * Consistent header with small logo and conditional back navigation
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';

interface HeaderProps {
    showBackLink?: boolean; // Force show/hide back link (auto-detected by default)
    backHref?: string; // Custom back destination (default: router.back())
    backLabel?: string; // Custom back label (default: "← TILLBAKA")
}

export default function Header({
    showBackLink,
    backHref,
    backLabel = '← TILLBAKA'
}: HeaderProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Auto-detect if we should show back link (not on main dashboard)
    const shouldShowBack = showBackLink ?? (pathname !== '/dashboard' && pathname !== '/');

    const handleBack = () => {
        if (backHref) {
            router.push(backHref);
        } else {
            router.back();
        }
    };

    return (
        <header className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
                <Logo size="small" />
                {shouldShowBack && (
                    <button
                        onClick={handleBack}
                        className="text-xs font-inter text-primary/60 hover:text-accent transition-colors uppercase tracking-wider text-left"
                    >
                        {backLabel}
                    </button>
                )}
            </div>
        </header>
    );
}
