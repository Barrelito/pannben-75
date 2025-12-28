/**
 * Stripe Checkout API Route
 * Creates a checkout session for one-time premium purchase
 */

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Initialize Stripe inside handler to avoid build-time env issues
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-12-15.clover',
        });

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 500 }
            );
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?premium=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?premium=cancelled`,
            client_reference_id: userId,
            metadata: {
                userId,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
