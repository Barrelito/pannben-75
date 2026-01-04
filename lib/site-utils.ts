// Server-side helper to detect site from headers
export type Site = 'pannben' | 'lifegrit';

export function getSiteFromHost(host: string): Site {
    return host.includes('lifegrit') ? 'lifegrit' : 'pannben';
}
