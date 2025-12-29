/**
 * Server Header - For Server Components
 * Consistent header with small logo and navigation link
 */

import Logo from '@/components/ui/Logo';
import Link from 'next/link';

interface ServerHeaderProps {
    showBackLink?: boolean;
    backHref?: string;
    backLabel?: string;
}

export default function ServerHeader({
    showBackLink = true,
    backHref = '/dashboard',
    backLabel = '← TILLBAKA'
}: ServerHeaderProps) {
    return (
        <header className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
                <Logo size="small" />
                {showBackLink && (
                    <Link
                        href={backHref}
                        className="text-xs font-inter text-primary/60 hover:text-accent transition-colors uppercase tracking-wider"
                    >
                        {backLabel}
                    </Link>
                )}
            </div>
        </header>
    );
}
