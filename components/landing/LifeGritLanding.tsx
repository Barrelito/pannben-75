'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '@/app/lifegrit-globals.css';

export default function LifeGritLanding() {
    const [providerCode, setProviderCode] = useState('');
    const router = useRouter();

    const handleSubmitCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (providerCode.trim()) {
            router.push(`/join?code=${encodeURIComponent(providerCode.trim().toUpperCase())}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lifegrit-bg">
            {/* Header */}
            <header className="lifegrit-header py-8 px-6">
                <div className="max-w-md mx-auto text-center">
                    {/* Logo Icon */}
                    <div className="mb-4 flex justify-center">
                        <div className="w-12 h-12 border-2 border-[var(--lg-gold-500)] flex items-center justify-center">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-[var(--lg-gold-500)]"
                            >
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                        </div>
                    </div>

                    {/* Brand */}
                    <h1 className="text-4xl font-bold text-white font-outfit tracking-tight">
                        LIFEGRIT
                    </h1>
                    <p className="text-[var(--lg-gold-400)] tracking-[0.3em] text-xs mt-1 font-outfit uppercase">
                        Små steg. Bättre dagar.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-6 py-12">
                <div className="max-w-md mx-auto space-y-8">

                    {/* Provider Code Section */}
                    <section className="lg-card">
                        <h2 className="lg-subheading mb-2">Har du en kod?</h2>
                        <p className="lg-body text-sm mb-4">
                            Ange koden från din arbetsgivare eller ditt gym för att gå med i deras utmaning.
                        </p>

                        <form onSubmit={handleSubmitCode} className="space-y-4">
                            <input
                                type="text"
                                value={providerCode}
                                onChange={(e) => setProviderCode(e.target.value.toUpperCase())}
                                placeholder="T.ex. NORDIC2026"
                                className="lg-input text-center tracking-widest text-lg"
                                maxLength={20}
                            />
                            <button
                                type="submit"
                                className="lg-btn-primary w-full"
                                disabled={!providerCode.trim()}
                            >
                                Gå med i utmaning
                            </button>
                        </form>
                    </section>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-[var(--lg-gray-300)]"></div>
                        <span className="text-[var(--lg-gray-500)] text-sm font-inter">eller</span>
                        <div className="flex-1 h-px bg-[var(--lg-gray-300)]"></div>
                    </div>

                    {/* Login Section */}
                    <section className="text-center">
                        <p className="lg-body text-sm mb-4">
                            Redan medlem?
                        </p>
                        <Link href="/login" className="lg-btn-secondary inline-block">
                            Logga in
                        </Link>
                    </section>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 px-6 text-center">
                <p className="text-[var(--lg-gray-500)] text-xs font-inter">
                    Bygg hälsosamma vanor. Dag för dag.
                </p>
            </footer>
        </div>
    );
}
