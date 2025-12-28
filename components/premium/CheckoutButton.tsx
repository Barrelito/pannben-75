/**
 * Checkout Button Component
 * Initiates Stripe Checkout for premium purchase
 */

'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
    userId: string;
    price?: string;
}

export default function CheckoutButton({ userId, price = '175 KR' }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Could not create checkout session');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert('Kunde inte starta betalning. Försök igen.');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full px-8 py-4 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? 'LADDAR...' : `💳 KÖP PREMIUM (${price})`}
        </button>
    );
}
