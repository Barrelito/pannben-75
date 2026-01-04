'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Site } from './site-utils';

interface SiteContextType {
    site: Site;
    isLifeGrit: boolean;
    isPannben: boolean;
}

const SiteContext = createContext<SiteContextType>({
    site: 'pannben',
    isLifeGrit: false,
    isPannben: true,
});

export function useSite() {
    return useContext(SiteContext);
}

interface SiteProviderProps {
    children: ReactNode;
    site: Site;
}

export function SiteProvider({ children, site }: SiteProviderProps) {
    const value: SiteContextType = {
        site,
        isLifeGrit: site === 'lifegrit',
        isPannben: site === 'pannben',
    };

    return (
        <SiteContext.Provider value={value}>
            {children}
        </SiteContext.Provider>
    );
}
