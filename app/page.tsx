import { headers } from 'next/headers';
import PannbenLanding from '@/components/landing/PannbenLanding';
import LifeGritLanding from '@/components/landing/LifeGritLanding';

export default async function RootPage() {
    const headersList = await headers();
    const host = headersList.get('host') || '';

    // Detect which site based on hostname
    const isLifeGrit = host.includes('lifegrit');

    if (isLifeGrit) {
        return <LifeGritLanding />;
    }

    return <PannbenLanding />;
}
