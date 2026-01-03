/**
 * Premium Paywall Modal
 * Shows benefits and purchase options for locked features
 */

'use client';

import Modal from '@/components/ui/Modal';
import CheckoutButton from './CheckoutButton';
import RedeemVip from './RedeemVip';

interface PremiumPaywallProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onRedeemVip: (code: string) => Promise<{ success: boolean; error?: string }>;
}

export default function PremiumPaywall({
    isOpen,
    onClose,
    userId,
    onRedeemVip,
}: PremiumPaywallProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="🔒 PREMIUM">
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="text-5xl mb-4">✨</div>
                    <p className="font-inter text-sm text-primary/80">
                        Lås upp alla funktioner för att maximera din 75-dagarsresa
                    </p>
                </div>

                {/* Benefits */}
                <div className="bg-surface border-2 border-accent/30 p-4 space-y-3">
                    <h3 className="font-teko text-xl uppercase tracking-wider text-accent">
                        PREMIUM FÖRDELAR
                    </h3>

                    <div className="space-y-2 font-inter text-sm text-primary/80">
                        <div className="flex items-center gap-3">
                            <span className="text-accent">✓</span>
                            <span>📅 Google Calendar-synk</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-accent">✓</span>
                            <span>💪 Träningsspelare med timer</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-accent">✓</span>
                            <span>⚔️ Squad/Pluton-funktion</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-accent">✓</span>
                            <span>🍽️ Diet-spårning och val</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-accent">✓</span>
                            <span>🚀 Framtida funktioner</span>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="text-center">
                    <p className="font-teko text-3xl text-accent">175 KR<span className="text-lg text-primary/60">/år</span></p>
                    <p className="font-inter text-xs text-primary/60 uppercase tracking-wider">
                        Kan avbrytas närsomhelst
                    </p>
                </div>

                {/* Checkout Button */}
                <CheckoutButton userId={userId} price="175 KR" />

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-primary/20" />
                    <span className="font-inter text-xs uppercase tracking-wider text-primary/60">
                        ELLER
                    </span>
                    <div className="flex-1 h-px bg-primary/20" />
                </div>

                {/* VIP Code */}
                <RedeemVip onRedeem={onRedeemVip} />
            </div>
        </Modal>
    );
}
