'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSquadFeed } from '@/hooks/useSquadFeed';
import { getTimeAgo } from '@/lib/utils/dates';

interface SquadFeedProps {
    squadId: string;
    userId: string;
}

export default function SquadFeed({ squadId, userId }: SquadFeedProps) {
    const { posts, loading, postMessage, toggleLike } = useSquadFeed(squadId, userId);
    const [newMessage, setNewMessage] = useState('');
    const [posting, setPosting] = useState(false);

    const handlePost = async () => {
        if (!newMessage.trim()) return;
        setPosting(true);
        try {
            await postMessage(newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to post:', error);
            alert('Kunde inte skicka stridsrop!');
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="mt-8">
            <h2 className="font-teko text-2xl uppercase text-primary mb-4">Stridsrop & Uppdateringar</h2>

            {/* Input Box */}
            <div className="bg-surface border-2 border-primary/20 p-4 mb-6">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Skrik ut din progress eller peppa truppen..."
                    className="w-full bg-transparent text-primary font-inter placeholder:text-primary/40 outline-none resize-none h-20 mb-2"
                />
                <div className="flex justify-end">
                    <button
                        onClick={handlePost}
                        disabled={!newMessage.trim() || posting}
                        className="px-4 py-2 bg-accent text-background font-inter font-bold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {posting ? 'SKRIKER...' : '📣 SKRIK UT'}
                    </button>
                </div>
            </div>

            {/* Feed */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-primary/10 rounded">
                    <p className="text-primary/40 font-inter italic">Tyst i etern... var den första att bryta tystnaden!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-surface border border-primary/10 p-4">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden relative">
                                    {post.author.avatar_url ? (
                                        <Image
                                            src={post.author.avatar_url}
                                            alt={post.author.display_name || 'User'}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary/40 font-teko">
                                            {(post.author.display_name || post.author.username || '?').substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-primary font-inter text-sm">
                                            {post.author.display_name || post.author.username || 'Okänd Soldat'}
                                        </span>
                                        <span className="text-[10px] text-primary/40">
                                            • {getTimeAgo(post.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-primary/90 font-inter text-sm whitespace-pre-wrap mb-4 pl-[52px]">
                                {post.content}
                            </p>

                            {/* Footer / Actions */}
                            <div className="pl-[52px] flex items-center gap-4">
                                <button
                                    onClick={() => toggleLike(post.id, post.has_liked)}
                                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.has_liked ? 'text-accent' : 'text-primary/40 hover:text-primary/60'
                                        }`}
                                >
                                    <span>👊</span>
                                    <span>{post.likes_count > 0 ? post.likes_count : 'Fist Bump'}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
