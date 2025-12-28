/**
 * Squad Management Hook
 * Handles squad creation, joining, and member roster with LEFT JOIN
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getToday } from '@/lib/utils/dates';
import type { Squad, SquadMember as DBSquadMember } from '@/types/database.types';
import type { RecoveryStatus } from '@/types/logic.types';

export interface SquadMember {
    id: string;
    user_id: string;
    role: 'admin' | 'member';
    joined_at: string;

    // From profiles (always present)
    username: string | null;
    display_name: string | null;
    avatar_url: string | null; // Added
    motto: string | null;      // Added
    recovery_status: RecoveryStatus;
    current_day: number;

    // From today's log (may be null if no log exists - LEFT JOIN!)
    workout_outdoor_completed: boolean | null;
    workout_indoor_completed: boolean | null;
    workouts_done: number; // Calculated: 0, 1, or 2
}

interface UseSquadResult {
    squad: Squad | null; // Currently selected squad
    squads: Squad[]; // All my squads
    members: SquadMember[];
    loading: boolean;
    error: string | null;

    createSquad: (name: string) => Promise<void>;
    joinSquad: (code: string) => Promise<string | void>; // Return string (ID) or void on error (though we throw now)
    leaveSquad: (squadId: string) => Promise<void>;
    refreshMembers: () => Promise<void>;
    fetchMySquads: () => Promise<Squad[]>;
    selectSquad: (squad: Squad) => void;
}

/**
 * Generate unique 6-character invite code (XXXX-XX format)
 */
function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    code += '-';
    for (let i = 0; i < 2; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export function useSquad(userId: string): UseSquadResult {
    const [squad, setSquad] = useState<Squad | null>(null);
    const [squads, setSquads] = useState<Squad[]>([]);
    const [members, setMembers] = useState<SquadMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    /**
     * Fetch all squads user belongs to
     */
    const fetchMySquads = useCallback(async () => {
        try {
            const { data: memberships } = await supabase
                .from('squad_members')
                .select('squad_id, squads(*)')
                .eq('user_id', userId);

            if (memberships) {
                // Map to Squad array
                const mySquads = memberships
                    .map(m => m.squads as unknown as Squad)
                    .filter(s => s !== null);

                // If we have squads, default to the first one if current squad is null
                if (mySquads.length > 0 && !squad) {
                    setSquad(mySquads[0]);
                }

                return mySquads;
            }
            return [];
        } catch (err) {
            console.error('Error fetching squads:', err);
            return [];
        }
    }, [userId, supabase, squad]);

    /**
     * Fetch squad members with profile and today's log
     * CRITICAL: Uses LEFT JOIN semantics - shows ALL members even without logs
     */
    const fetchMembers = useCallback(async (squadId: string) => {
        try {
            const today = getToday();

            // Fetch all squad members
            const { data: squadMembers, error: membersError } = await supabase
                .from('squad_members')
                .select('id, user_id, role, joined_at')
                .eq('squad_id', squadId);

            if (membersError) throw membersError;
            if (!squadMembers) {
                setMembers([]);
                return;
            }

            // For each member, fetch their profile and today's log
            const memberPromises = squadMembers.map(async (member) => {
                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username, display_name, recovery_status, current_day, avatar_url, motto')
                    .eq('id', member.user_id)
                    .single();

                // Fetch today's log (may not exist - that's OK!)
                const { data: log } = await supabase
                    .from('daily_logs')
                    .select('workout_outdoor_completed, workout_indoor_completed')
                    .eq('user_id', member.user_id)
                    .eq('log_date', today)
                    .maybeSingle(); // maybeSingle() doesn't error if not found

                // Calculate workouts done
                let workouts_done = 0;
                if (log?.workout_outdoor_completed) workouts_done++;
                if (log?.workout_indoor_completed) workouts_done++;

                return {
                    id: member.id,
                    user_id: member.user_id,
                    role: member.role as 'admin' | 'member',
                    joined_at: member.joined_at,
                    username: profile?.username || null,
                    display_name: profile?.display_name || null,
                    avatar_url: profile?.avatar_url || null,
                    motto: profile?.motto || null,
                    recovery_status: (profile?.recovery_status || 'GREEN') as RecoveryStatus,
                    current_day: profile?.current_day || 0,
                    workout_outdoor_completed: log?.workout_outdoor_completed || null,
                    workout_indoor_completed: log?.workout_indoor_completed || null,
                    workouts_done,
                };
            });

            const memberData = await Promise.all(memberPromises);

            // Sort by current_day descending (highest streak first)
            memberData.sort((a, b) => b.current_day - a.current_day);

            setMembers(memberData);
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('Kunde inte hämta medlemmar');
        }
    }, [supabase]);

    /**
     * Refresh member data
     */
    const refreshMembers = useCallback(async () => {
        if (squad?.id) {
            await fetchMembers(squad.id);
        }
    }, [squad?.id, fetchMembers]);

    /**
     * Create a new squad
     */
    const createSquad = useCallback(async (name: string) => {
        setLoading(true);
        setError(null);

        try {
            // Validate name - prevent accidental code entry
            if (/^[A-Z0-9]{4}-[A-Z0-9]{2}$/.test(name.toUpperCase())) {
                throw new Error('Detta ser ut som en inbjudningskod. Använd "Gå med" istället för att skapa nytt.');
            }

            // Generate unique invite code
            let inviteCode = generateInviteCode();

            // Insert squad
            const { data: newSquad, error: squadError } = await supabase
                .from('squads')
                .insert({
                    name,
                    invite_code: inviteCode,
                    created_by: userId,
                })
                .select()
                .single();

            if (squadError) throw squadError;

            // Add creator as admin member
            const { error: memberError } = await supabase
                .from('squad_members')
                .insert({
                    squad_id: newSquad.id,
                    user_id: userId,
                    role: 'admin',
                });

            if (memberError) throw memberError;

            // Refresh data
            await fetchMySquads();
            await fetchMembers(newSquad.id);
        } catch (err: any) {
            console.error('Error creating squad:', err);
            setError(err.message || 'Kunde inte skapa pluton');
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchMySquads, fetchMembers]);

    /**
     * Join a squad by invite code
     */
    const joinSquad = useCallback(async (code: string) => {
        setLoading(true);
        setError(null);

        try {
            // Find squad by invite code
            const cleanedCode = code.trim().toUpperCase();

            console.log('Searching for squad with code:', cleanedCode);

            const { data: foundSquad, error: findError } = await supabase
                .from('squads')
                .select('id')
                .eq('invite_code', cleanedCode)
                .single();

            if (findError) console.error('Supabase find error:', findError);
            if (!foundSquad) console.error('No squad found');

            if (findError || !foundSquad) {
                throw new Error('Ogiltig kod');
            }

            // Check if user is already in a squad
            const { data: existingMembership } = await supabase
                .from('squad_members')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

            if (existingMembership) {
                throw new Error('Du är redan med i en pluton');
            }

            // Add user to squad
            const { error: joinError } = await supabase
                .from('squad_members')
                .insert({
                    squad_id: foundSquad.id,
                    user_id: userId,
                    role: 'member',
                });

            if (joinError) throw joinError;

            // Refresh data
            await fetchMySquads();
            await fetchMembers(foundSquad.id);
            return foundSquad.id; // Return the ID for redirection
        } catch (err: any) {
            console.error('Error joining squad:', err);
            setError(err.message || 'Kunde inte gå med i pluton');
            throw err; // Re-throw to handle in UI
        } finally {
            setLoading(false);
        }
    }, [userId, supabase, fetchMySquads, fetchMembers]);

    /**
     * Leave current squad
     */
    /**
     * Leave a specific squad
     */
    const leaveSquad = useCallback(async (squadId: string) => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('squad_members')
                .delete()
                .eq('user_id', userId)
                .eq('squad_id', squadId);

            if (deleteError) throw deleteError;

            // Refresh list
            const updatedSquads = await fetchMySquads();

            // If we left the current squad, select another one or null
            if (squad?.id === squadId) {
                setSquad(updatedSquads.length > 0 ? updatedSquads[0] : null);
                if (updatedSquads.length > 0) {
                    await fetchMembers(updatedSquads[0].id);
                } else {
                    setMembers([]);
                }
            }
        } catch (err: any) {
            console.error('Error leaving squad:', err);
            setError(err.message || 'Kunde inte lämna pluton');
        } finally {
            setLoading(false);
        }
    }, [squad, userId, supabase, fetchMySquads, fetchMembers]);

    // Initial load
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const mySquads = await fetchMySquads();
            setSquads(mySquads);

            // If we have a selected squad, fetch members for it
            if (squad) {
                await fetchMembers(squad.id);
            } else if (mySquads.length > 0) {
                // Default to first squad
                setSquad(mySquads[0]);
                await fetchMembers(mySquads[0].id);
            }

            setLoading(false);
        };

        if (userId) {
            init();
        }
    }, [userId, fetchMySquads, fetchMembers]); // Remove squad dependency to avoid loops

    return {
        squad,
        squads,
        members,
        loading,
        error,
        createSquad,
        joinSquad,
        leaveSquad,
        refreshMembers,
        fetchMySquads,
        selectSquad: setSquad,
    };
}
