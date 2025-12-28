/**
 * Modal Component
 * Reusable modal wrapper with backdrop and animations
 */

'use client';

import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'md',
}: ModalProps) {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Prevent scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClass = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full ${maxWidthClass} bg-surface border-2 border-primary/20 p-6 animate-in fade-in-0 zoom-in-95 duration-200`}
            >
                {/* Title */}
                {title && (
                    <h2 className="font-teko text-2xl uppercase tracking-wider text-primary mb-6">
                        {title}
                    </h2>
                )}

                {/* Content */}
                <div>{children}</div>

                {/* Close Button (X) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-primary/60 hover:text-accent transition-colors"
                    aria-label="Close"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
