/**
 * Audio Beep System
 * Uses Web Audio API for reliable cross-platform beeps
 */

class AudioBeeper {
    private audioContext: AudioContext | null = null;

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    /**
     * Play a single beep
     */
    playBeep(frequency: number = 440, duration: number = 0.1): void {
        try {
            const ctx = this.getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (error) {
            console.error('Error playing beep:', error);
        }
    }

    /**
     * Play countdown sequence (3-2-1)
     */
    async playCountdown(): Promise<void> {
        this.playBeep(440, 0.15); // Beep 1
        await this.wait(1000);
        this.playBeep(440, 0.15); // Beep 2
        await this.wait(1000);
        this.playBeep(880, 0.2);  // Beep 3 (higher pitch)
    }

    /**
     * Play interval change sound
     */
    playIntervalChange(type: 'run' | 'walk'): void {
        if (type === 'run') {
            this.playBeep(880, 0.2); // Higher pitch for run
        } else {
            this.playBeep(330, 0.2); // Lower pitch for walk
        }
    }

    /**
     * Play completion fanfare
     */
    async playCompletion(): Promise<void> {
        this.playBeep(523, 0.15); // C
        await this.wait(150);
        this.playBeep(659, 0.15); // E
        await this.wait(150);
        this.playBeep(784, 0.3);  // G (longer)
    }

    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
export const beeper = new AudioBeeper();

// Convenience exports
export const playBeep = (frequency?: number, duration?: number) => beeper.playBeep(frequency, duration);
export const playCountdown = () => beeper.playCountdown();
export const playIntervalChange = (type: 'run' | 'walk') => beeper.playIntervalChange(type);
export const playCompletion = () => beeper.playCompletion();
