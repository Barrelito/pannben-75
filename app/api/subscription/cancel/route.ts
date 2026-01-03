/**
 * Cancel Subscription API Route
 * Cancels the user's Stripe subscription
 */

import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Ej inloggad' },
                { status: 401 }
            );
        }

        // Get user's Stripe customer ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            return NextResponse.json(
                { error: 'Inget aktivt abonnemang hittat' },
                { status: 400 }
            );
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-12-15.clover',
        });

        // Get the customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json(
                { error: 'Inget aktivt abonnemang hittat' },
                { status: 400 }
            );
        }

        // Cancel the subscription at period end (not immediately)
        const subscription = await stripe.subscriptions.update(
            subscriptions.data[0].id,
            { cancel_at_period_end: true }
        );

        return NextResponse.json({
            success: true,
            message: 'Abonnemanget avslutas vid periodens slut',
            cancelAt: subscription.cancel_at,
        });
    } catch (error: any) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json(
            { error: error.message || 'Kunde inte avsluta abonnemanget' },
            { status: 500 }
        );
    }
}
