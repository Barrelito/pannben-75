/**
 * Join Squad Client Component
 * Landing page for invite links
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSquad } from '@/hooks/useSquad';
import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

interface JoinSquadClientProps {
    squadName: string;
    inviteCode: string;
}

export default function JoinSquadClient({ squadName, inviteCode }: JoinSquadClientProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'JOINING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Check if logged in
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        checkUser();
    }, [supabase]);

    const { joinSquad } = useSquad(userId || '');

    const handleJoin = async () => {
        setLoading(true);
        setError(null);

        if (!userId) {
            // Not logged in -> Redirect to login with return URL
            const returnUrl = `/join/${inviteCode}`;
            router.push(`/login?next=${encodeURIComponent(returnUrl)}`);
            return;
        }

        setStatus('JOINING');

        try {
            await joinSquad(inviteCode);
            setStatus('SUCCESS');
            // Redirect happens in background but let's be explicit
            setTimeout(() => router.push('/squad'), 1000);
        } catch (err: any) {
            console.error('Join error:', err);

            // Should redirect if already member?
            if (err.message?.includes('redan med')) {
                setStatus('SUCCESS');
                setTimeout(() => router.push('/squad'), 1000);
                return;
            }

            setStatus('ERROR');
            setError(err.message || 'Kunde inte gå med');
            setLoading(false);
        }
    };

    return (
        <MobileContainer>
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
                <div className="mb-12 scale-125">
                    <Logo />
                </div>

                <div className="space-y-6 max-w-sm w-full">
                    <div className="space-y-2">
                        <p className="font-inter text-primary/60 text-sm tracking-widest uppercase">
                            REKRYTERING
                        </p>
                        <h1 className="font-teko text-5xl text-accent uppercase leading-none">
                            {squadName}
                        </h1>
                        <p className="font-inter text-primary text-lg">
                            Din plats i ledet väntar.
                        </p>
                    </div>


                    {error && (
                        <div className="p-4 bg-status-red/10 border-2 border-status-red text-status-red text-sm font-inter">
                            {error}
                        </div>
                    )}

                    <div className="pt-8">
                        <button
                            onClick={handleJoin}
                            disabled={loading || status === 'SUCCESS'}
                            className={`w-full py-6 font-teko font-bold text-2xl uppercase tracking-widest border-2 transition-all duration-300 ${status === 'SUCCESS'
                                    ? 'bg-status-green border-status-green text-background'
                                    : 'bg-accent text-background border-accent hover:bg-transparent hover:text-accent'
                                }`}
                        >
                            {status === 'JOINING' ? 'GÅR MED...' :
                                status === 'SUCCESS' ? 'VÄLKOMMEN!' :
                                    userId ? 'GÅ MED NU' : 'LOGGA IN & GÅ MED'}
                        </button>

                        {!userId && (
                            <p className="mt-4 text-xs text-primary/40 font-inter">
                                Du skickas till inloggning först
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </MobileContainer>
    );
}
