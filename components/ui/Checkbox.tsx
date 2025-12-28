/**
 * Checkbox Component
 * Styled checkbox for the 5 Rules
 */

'use client';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}

export default function Checkbox({
    checked,
    onChange,
    label,
    disabled = false,
}: CheckboxProps) {
    return (
        <label
            className={`
        flex items-center gap-3 cursor-pointer group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            {/* Hidden native checkbox for accessibility */}
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="sr-only"
            />

            {/* Custom checkbox */}
            <div
                className={`
          w-6 h-6 flex items-center justify-center border-2 transition-all duration-200
          ${checked
                        ? 'bg-accent border-accent'
                        : 'bg-surface border-primary/20 group-hover:border-accent/50'
                    }
          ${disabled ? '' : 'group-hover:scale-110'}
        `}
            >
                {checked && (
                    <svg
                        className="w-4 h-4 text-background"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </div>

            {/* Label */}
            <span className="font-inter text-sm uppercase tracking-wider text-primary">
                {label}
            </span>
        </label>
    );
}
