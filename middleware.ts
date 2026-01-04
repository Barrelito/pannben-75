import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';

    // Detect which site based on hostname
    const isLifeGrit = hostname.includes('lifegrit');

    // Update session for auth
    const response = await updateSession(request);

    // Set header so components can detect which site
    response.headers.set('x-site', isLifeGrit ? 'lifegrit' : 'pannben');

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
