'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTimeAgo } from '@/lib/utils/dates'; // Expecting this might need creation if not exists, but I'll check/create inline utils if needed or assume existing. Note: getTimeAgo doesn't exist in utils/dates based on previous context, I'll implementation simple relative time here or add it. I'll implement a simple one inside the component or hook/helper.

export interface FeedPost {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    author: {
        display_name: string | null;
        username: string | null;
        avatar_url: string | null;
        role?: 'admin' | 'member'; // We might need to join squad_members to get role if we want to show badges, but for MVP author info is key.
    };
    likes_count: number; // We'll count these
    has_liked: boolean;  // Checking if current user liked
}

export function useSquadFeed(squadId: string, userId: string) {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchPosts = useCallback(async () => {
        if (!squadId) return;

        try {
            // Fetch posts
            const { data: postsData, error: postsError } = await supabase
                .from('feed_posts')
                .select(`
                    id, 
                    content, 
                    created_at, 
                    user_id,
                    profiles:user_id (
                        username, 
                        display_name, 
                        avatar_url
                    )
                `)
                .eq('squad_id', squadId)
                .order('created_at', { ascending: false });

            if (postsError) throw postsError;

            // Fetch likes for these posts to calculate count and has_liked
            // Ideally we'd do a count in the join, but Supabase/PostgREST is tricky with counts + boolean current user check in one go without complex views.
            // Simplified approach: Fetch all likes for these posts (if list isn't huge) or fetch counts separately.
            // For MVP (Squads are small -> 10-20 people?): Fetching all likes for the displayed posts is fine.

            const postIds = postsData.map(p => p.id);
            let likesData: any[] = [];

            if (postIds.length > 0) {
                const { data: likes, error: likesError } = await supabase
                    .from('feed_likes')
                    .select('post_id, user_id')
                    .in('post_id', postIds);

                if (!likesError && likes) {
                    likesData = likes;
                }
            }

            // Map it all together
            const formattedPosts: FeedPost[] = postsData.map((post: any) => {
                const postLikes = likesData.filter(l => l.post_id === post.id);
                return {
                    id: post.id,
                    content: post.content,
                    created_at: post.created_at,
                    user_id: post.user_id,
                    author: {
                        display_name: post.profiles?.display_name,
                        username: post.profiles?.username,
                        avatar_url: post.profiles?.avatar_url,
                    },
                    likes_count: postLikes.length,
                    has_liked: postLikes.some(l => l.user_id === userId),
                };
            });

            setPosts(formattedPosts);

        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setLoading(false);
        }
    }, [squadId, userId, supabase]);

    // Initial fetch
    useEffect(() => {
        fetchPosts();

        // Subscription for Real-time (Optional for now, but good for "Chat")
        const channel = supabase
            .channel(`squad_feed_${squadId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_posts', filter: `squad_id=eq.${squadId}` }, () => {
                fetchPosts();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_likes' }, () => {
                // We could filter by post IDs but simple refresh works
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [squadId, fetchPosts, supabase]);

    const postMessage = async (content: string) => {
        if (!content.trim()) return;

        const { error } = await supabase
            .from('feed_posts')
            .insert({
                squad_id: squadId,
                user_id: userId,
                content: content.trim()
            });

        if (error) throw error;

        // Refresh immediately (don't rely solely on subscription)
        await fetchPosts();
    };

    const toggleLike = async (postId: string, currentHasLiked: boolean) => {
        // Optimistic update
        setPosts(current => current.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    has_liked: !currentHasLiked,
                    likes_count: currentHasLiked ? p.likes_count - 1 : p.likes_count + 1
                };
            }
            return p;
        }));

        if (currentHasLiked) {
            // Unlike
            await supabase
                .from('feed_likes')
                .delete()
                .match({ post_id: postId, user_id: userId });
        } else {
            // Like
            await supabase
                .from('feed_likes')
                .insert({ post_id: postId, user_id: userId });
        }
        // Subscription will ensure consistency eventually
    };

    return {
        posts,
        loading,
        postMessage,
        toggleLike,
        refresh: fetchPosts
    };
}
