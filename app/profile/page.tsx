'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/layout/MobileContainer';
import Logo from '@/components/ui/Logo';
import AvatarUpload from '@/components/profile/AvatarUpload';
import type { User } from '@supabase/supabase-js';

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // Profile State
    const [originalUsername, setOriginalUsername] = useState<string | null>(null); // To change username if we allowed it, but usually display_name is better
    const [displayName, setDisplayName] = useState('');
    const [motto, setMotto] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUser(user);

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username, display_name, motto, avatar_url`)
                .eq('id', user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setOriginalUsername(data.username);
                setDisplayName(data.display_name || '');
                setMotto(data.motto || '');
                setAvatarUrl(data.avatar_url);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async () => {
        if (!user) return;

        try {
            setSaving(true);

            const updates = {
                id: user.id,
                display_name: displayName,
                motto: motto,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            // Check for username updates if we decide to allow that later
            // But for now, we just update display_name and motto and avatar

            alert('Profil uppdaterad! 💾');
        } catch (error: any) {
            alert('Fel vid sparning: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MobileContainer>
                <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
            </MobileContainer>
        );
    }

    return (
        <MobileContainer>
            <div className="min-h-screen bg-background pb-20 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Logo />
                    <button onClick={() => router.back()} className="text-primary/60 hover:text-accent">
                        TILLBAKA
                    </button>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="font-teko text-5xl uppercase tracking-wider text-accent mb-2">
                        IDENTITET
                    </h1>
                    <p className="font-inter text-primary/80">
                        Vem är du i ledet?
                    </p>
                </div>

                {user && (
                    <div className="flex flex-col gap-8">
                        {/* Avatar */}
                        <AvatarUpload
                            userId={user.id}
                            url={avatarUrl}
                            onUpload={(url) => setAvatarUrl(url)}
                            size={180}
                        />

                        {/* Form */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-primary/60 uppercase tracking-widest mb-2">
                                    Användarnamn
                                </label>
                                <input
                                    type="text"
                                    value={originalUsername || ''}
                                    disabled
                                    className="w-full bg-surface/50 border border-primary/10 p-4 text-primary/40 font-inter cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-accent uppercase tracking-widest mb-2">
                                    Visningsnamn (Soldatnamn)
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-surface border border-primary/20 p-4 text-primary font-inter focus:border-accent outline-none transition-colors"
                                    placeholder="T.ex. Kalle"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-accent uppercase tracking-widest mb-2">
                                    Motto
                                </label>
                                <input
                                    type="text"
                                    value={motto}
                                    onChange={(e) => setMotto(e.target.value)}
                                    className="w-full bg-surface border border-primary/20 p-4 text-primary font-inter focus:border-accent outline-none transition-colors"
                                    placeholder="T.ex. Pannben av stål"
                                    maxLength={50}
                                />
                                <div className="text-right text-[10px] text-primary/40 mt-1">
                                    {motto.length}/50
                                </div>
                            </div>

                            <button
                                onClick={updateProfile}
                                disabled={saving}
                                className="w-full py-4 mt-8 bg-accent text-background font-inter font-bold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Sparar...' : 'SPARA PROFIL'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MobileContainer>
    );
}
