/**
 * Running Coach Main Page - Server Component
 * Premium-gated access to running program
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getWeek } from '@/lib/data/runningProgram';
import MobileContainer from '@/components/layout/MobileContainer';
import ServerHeader from '@/components/layout/ServerHeader';
import WeekCard from '@/components/run/WeekCard';
import Link from 'next/link';

export default async function RunPage() {
    const supabase = await createClient();

    // Auth check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check premium status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

    const isPremium = profile?.is_premium || false;

    // Get week 1 data
    const week1 = getWeek(1);

    if (!week1) {
        return (
            <MobileContainer>
                <div className="min-h-screen bg-background p-6">
                    <p className="text-primary">Program data saknas.</p>
                </div>
            </MobileContainer>
        );
    }

    return (
        <MobileContainer>
            <div className="min-h-screen bg-background p-6 pb-20">
                {/* Header */}
                <ServerHeader />

                {/* Title */}
                <div className="mb-8">
                    <h1 className="font-teko text-6xl uppercase tracking-wider text-accent mb-2">
                        LÖPCOACH
                    </h1>
                    <p className="font-inter text-primary/80">
                        Från soffa till 5km på 9 veckor.
                    </p>
                </div>

                {isPremium ? (
                    <>
                        {/* Premium Content */}
                        <div className="mb-6 bg-status-green/10 border-2 border-status-green p-4">
                            <p className="font-inter text-sm text-status-green uppercase tracking-wider">
                                ✨ PREMIUM AKTIVERAD
                            </p>
                        </div>

                        <WeekCard week={week1} />

                        <div className="mt-8 bg-surface border border-primary/10 p-6 text-center">
                            <p className="font-inter text-xs text-primary/60">
                                🎧 Använd hörlurar för bästa upplevelse
                            </p>
                            <p className="font-inter text-xs text-primary/60 mt-2">
                                📱 Skärmen stannar på under passet
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Locked Content */}
                        <div className="bg-surface border-2 border-primary/20 p-8 text-center">
                            <div className="text-6xl mb-6">🔒</div>
                            <h2 className="font-teko text-4xl uppercase text-primary mb-4">
                                PREMIUM KRÄVS
                            </h2>
                            <p className="font-inter text-primary/80 mb-8">
                                Löpcoachen är en premiumfunktion. Uppgradera för att få tillgång till progressiva träningspass med ljudcoaching.
                            </p>

                            <div className="bg-accent/10 border border-accent p-4 mb-6">
                                <p className="font-inter text-sm text-accent font-bold mb-2">
                                    INGÅR I PREMIUM:
                                </p>
                                <ul className="font-inter text-xs text-primary/80 space-y-1 text-left">
                                    <li>✓ 9 veckors strukturerat löpprogram</li>
                                    <li>✓ Röstcoaching på svenska</li>
                                    <li>✓ Intervallbaserad träning</li>
                                    <li>✓ Skärmen stannar på automatiskt</li>
                                </ul>
                            </div>

                            <Link
                                href="/dashboard"
                                className="inline-block px-8 py-4 bg-accent text-background font-inter font-bold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all"
                            >
                                UPPGRADERA TILL PREMIUM
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </MobileContainer>
    );
}
