/**
 * Date Utilities for Pannben 75
 * Handles date calculations, formatting, and grace period logic
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterday(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
    return dateString === getToday();
}

/**
 * Check if a date string is yesterday
 */
export function isYesterday(dateString: string): boolean {
    return dateString === getYesterday();
}

/**
 * Calculate day number in the 75-day challenge
 * 
 * @param startDate - User's challenge start date (YYYY-MM-DD)
 * @param currentDate - Current date to calculate from (defaults to today)
 * @returns Day number (1-75), or 0 if before start
 */
export function getDayNumber(startDate: string, currentDate?: string): number {
    const start = new Date(startDate);
    const current = new Date(currentDate || getToday());

    // Calculate difference in days
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Day 0 becomes Day 1 (start date is Day 1)
    const dayNumber = diffDays + 1;

    // Clamp to valid range
    if (dayNumber < 1) return 0;
    if (dayNumber > 75) return 75;

    return dayNumber;
}

/**
 * Get date string for a specific day in the challenge
 * 
 * @param startDate - User's challenge start date
 * @param dayNumber - Target day (1-75)
 */
export function getDateForDay(startDate: string, dayNumber: number): string {
    const start = new Date(startDate);
    start.setDate(start.getDate() + (dayNumber - 1));
    return start.toISOString().split('T')[0];
}

/**
 * Format date for display (e.g., "28 Dec 2025")
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Get date range for a week
 */
export function getWeekDates(startDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
}

/**
 * Get relative time string (e.g. "2h ago")
 */
export function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " år sedan";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mån sedan";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dagar sedan";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h sedan";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m sedan";

    return "just nu";
}
