'use client';

import { useState } from 'react';

interface TimerSettingsDialogProps {
    currentDuration: number; // in seconds
    onSave: (duration: number) => void;
    onClose: () => void;
}

export default function TimerSettingsDialog({
    currentDuration,
    onSave,
    onClose
}: TimerSettingsDialogProps) {
    const [minutes, setMinutes] = useState(Math.floor(currentDuration / 60));
    const [seconds, setSeconds] = useState(currentDuration % 60);

    const presets = [
        { label: '30s', value: 30 },
        { label: '1:00', value: 60 },
        { label: '1:30', value: 90 },
        { label: '2:00', value: 120 },
        { label: '3:00', value: 180 },
    ];

    const handleSave = () => {
        const totalSeconds = (minutes * 60) + seconds;
        onSave(Math.max(10, totalSeconds)); // Minimum 10 seconds
    };

    const handlePreset = (value: number) => {
        setMinutes(Math.floor(value / 60));
        setSeconds(value % 60);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm bg-surface border-2 border-accent p-6">
                <h2 className="font-teko text-2xl uppercase tracking-wider text-primary text-center mb-6">
                    Ställ in vilotid
                </h2>

                {/* Time inputs */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={10}
                        value={minutes}
                        onChange={(e) => setMinutes(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                        className="w-16 h-14 bg-background border-2 border-primary/30 text-center font-teko text-3xl text-primary focus:border-accent focus:outline-none"
                    />
                    <span className="font-teko text-3xl text-primary/60">:</span>
                    <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={59}
                        value={seconds.toString().padStart(2, '0')}
                        onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-16 h-14 bg-background border-2 border-primary/30 text-center font-teko text-3xl text-primary focus:border-accent focus:outline-none"
                    />
                    <span className="font-inter text-sm text-primary/40 ml-2">min:sek</span>
                </div>

                {/* Presets */}
                <p className="font-inter text-xs uppercase text-primary/40 text-center mb-3">Snabbval</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {presets.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => handlePreset(preset.value)}
                            className={`px-4 py-2 border font-inter text-sm transition-colors ${(minutes * 60 + seconds) === preset.value
                                    ? 'border-accent bg-accent/20 text-accent'
                                    : 'border-primary/20 text-primary/60 hover:border-accent hover:text-accent'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-primary/20 text-primary/60 font-inter text-sm uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-accent text-background font-inter font-semibold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors"
                    >
                        Spara
                    </button>
                </div>
            </div>
        </>
    );
}
