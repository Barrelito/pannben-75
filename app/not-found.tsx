/**
 * 404 Not Found Page
 * Spartan-themed error page
 */

import Link from 'next/link';
import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';

export default function NotFound() {
    return (
        <MobileContainer>
            <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <Logo />

                <div className="mt-12 space-y-6">
                    <h1 className="font-teko text-9xl text-accent leading-none">
                        404
                    </h1>

                    <h2 className="font-teko text-3xl uppercase tracking-wider text-primary">
                        DU GICK VILSE
                    </h2>

                    <p className="font-inter text-primary/80 max-w-md">
                        Gå tillbaka till ledet. Vägen framåt finns inte här.
                    </p>

                    <Link
                        href="/dashboard"
                        className="inline-block mt-8 px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                    >
                        ← TILLBAKA TILL DASHBOARD
                    </Link>
                </div>
            </main>
        </MobileContainer>
    );
}
