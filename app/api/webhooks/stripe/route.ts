/**
 * Stripe Webhook Handler
 * Receives events from Stripe and updates user premium status
 */

import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

// Disable body parsing - we need raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2025-12-15.clover',
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json(
            { error: 'Webhook secret not configured' },
            { status: 500 }
        );
    }

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature provided' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string | null;

        if (!userId) {
            console.error('No client_reference_id in session');
            return NextResponse.json(
                { error: 'No user ID in session' },
                { status: 400 }
            );
        }

        try {
            const supabase = createSupabaseAdmin();

            // Update user to premium
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_premium: true,
                    stripe_customer_id: customerId,
                })
                .eq('id', userId);

            if (error) {
                console.error('Database update failed:', error);
                return NextResponse.json(
                    { error: 'Database update failed' },
                    { status: 500 }
                );
            }

            console.log(`✅ User ${userId} upgraded to premium`);
        } catch (err: any) {
            console.error('Error updating user:', err);
            return NextResponse.json(
                { error: 'Failed to update user' },
                { status: 500 }
            );
        }
    }

    // Handle subscription deleted/cancelled event
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        try {
            const supabase = createSupabaseAdmin();

            // Find user by stripe_customer_id and remove premium
            const { error } = await supabase
                .from('profiles')
                .update({ is_premium: false })
                .eq('stripe_customer_id', customerId);

            if (error) {
                console.error('Database update failed:', error);
                return NextResponse.json(
                    { error: 'Database update failed' },
                    { status: 500 }
                );
            }

            console.log(`❌ Customer ${customerId} premium removed (subscription ended)`);
        } catch (err: any) {
            console.error('Error removing premium:', err);
            return NextResponse.json(
                { error: 'Failed to update user' },
                { status: 500 }
            );
        }
    }

    // Return success for all events (Stripe expects 200)
    return NextResponse.json({ received: true });
}
