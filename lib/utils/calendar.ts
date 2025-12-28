/**
 * Google Calendar Link Generator
 * Creates Google Calendar event links with pre-filled data
 */

interface CalendarEvent {
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    durationMinutes: number;
    description?: string;
}

/**
 * Generate Google Calendar "Add to Calendar" link
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
    const { title, date, startTime, durationMinutes, description } = event;

    // Format: YYYYMMDDTHHMMSS
    const startDate = date.replace(/-/g, '');
    const startTimeFormatted = startTime.replace(':', '') + '00';
    const start = `${startDate}T${startTimeFormatted}`;

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    const end = `${startDate}T${String(endHours).padStart(2, '0')}${String(endMins).padStart(2, '0')}00`;

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${start}/${end}`,
        details: description || 'Pannben 75 Träning',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}
