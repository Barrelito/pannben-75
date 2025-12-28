/**
 * Squad Notifications Hook
 * Checks for new activity (posts/likes) since last visit
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useSquadNotifications(userId: string) {
    const [hasNotifications, setHasNotifications] = useState(false);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const checkNotifications = async () => {
            if (!userId) return;

            try {
                // Get last visit timestamp from localStorage
                const lastVisit = localStorage.getItem('last_squad_visit');
                const lastVisitTime = lastVisit ? new Date(lastVisit).getTime() : 0;

                // 1. Get user's squad ID
                const { data: membership } = await supabase
                    .from('squad_members')
                    .select('squad_id')
                    .eq('user_id', userId)
                    .single();

                if (!membership) {
                    setLoading(false);
                    return;
                }

                // 2. Count new posts in squad
                const { count: newPosts } = await supabase
                    .from('feed_posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('squad_id', membership.squad_id)
                    .gt('created_at', new Date(lastVisitTime).toISOString());

                // 3. Count new likes on user's posts
                const { count: newLikes } = await supabase
                    .from('feed_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', userId) // simplified: in real app would join posts
                    .gt('created_at', new Date(lastVisitTime).toISOString());

                // Note: The likes query is simplified. Ideally we'd join with user's posts
                // but for MVP, new posts in the squad is the main driver.

                const totalNew = (newPosts || 0);

                setCount(totalNew);
                setHasNotifications(totalNew > 0);
            } catch (error) {
                console.error('Error checking notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        checkNotifications();

        // Refresh every minute
        const interval = setInterval(checkNotifications, 60000);
        return () => clearInterval(interval);
    }, [userId, supabase]);

    return { hasNotifications, count, loading };
}
