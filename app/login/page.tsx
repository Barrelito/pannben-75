'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/ui/Logo';
import MobileContainer from '@/components/layout/MobileContainer';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const router = useRouter();
    const supabase = createClient();

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;
                router.push('/dashboard');
                router.refresh();
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ett oväntat fel inträffade');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileContainer>
            <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
                <div className="w-full max-w-sm space-y-8">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <Logo />
                    </div>

                    {/* Subheading */}
                    <h2 className="text-center font-inter text-sm font-light text-primary tracking-wider uppercase">
                        HÅRT ARBETE. SMART VILA.
                    </h2>

                    {/* Error Message */}
                    {error && (
                        <div className={`p-4 rounded-none border-2 ${error.includes('Kolla')
                            ? 'border-status-green bg-status-green/10 text-status-green'
                            : 'border-status-red bg-status-red/10 text-status-red'
                            }`}>
                            <p className="text-sm font-inter">{error}</p>
                        </div>
                    )}

                    {/* Auth Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-inter font-medium text-primary mb-2">
                                E-POST
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-surface border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none rounded-none"
                                placeholder="din.epost@exempel.se"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-inter font-medium text-primary mb-2">
                                LÖSENORD
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-surface border-2 border-primary/20 text-primary font-inter focus:border-accent focus:outline-none rounded-none"
                                placeholder="Minst 6 tecken"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider rounded-none border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'LADDAR...' : mode === 'login' ? 'LOGGA IN' : 'SKAPA KONTO'}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-sm font-inter text-primary/60 hover:text-accent transition-colors"
                        >
                            {mode === 'login' ? 'Inget konto? Skapa ett här' : 'Har redan ett konto? Logga in'}
                        </button>
                    </div>
                </div>
            </main>
        </MobileContainer>
    );
}
