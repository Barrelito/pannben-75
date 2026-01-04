import type { Metadata } from "next";
import { Teko, Inter, Outfit } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { SiteProvider } from "@/lib/site-context";
import { getSiteFromHost } from "@/lib/site-utils";

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const isLifeGrit = host.includes('lifegrit');

  if (isLifeGrit) {
    return {
      title: "LifeGrit | Små steg. Bättre dagar.",
      description: "Bygg hälsosamma vanor dag för dag. Gå med i din arbetsgivares eller ditt gyms utmaning.",
      manifest: "/manifest.json",
      icons: {
        icon: "/icon-192.png",
        apple: "/icon-192.png",
      },
    };
  }

  return {
    title: "Pannben 75 | Det ultimata testet",
    description: "Spåra din återhämtning, träning och kost. Bygg din disciplin. 75 dagar. Inga ursäkter.",
    manifest: "/manifest.json",
    openGraph: {
      title: "Pannben 75 | Det ultimata testet",
      description: "75 dagar. Inga ursäkter. En svensk variant av 75 Hard.",
      type: "website",
      locale: "sv_SE",
    },
    icons: {
      icon: "/icon-192.png",
      apple: "/icon-192.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const site = getSiteFromHost(host);

  return (
    <html lang="sv">
      <body
        className={`${teko.variable} ${inter.variable} ${outfit.variable} antialiased`}
      >
        <SiteProvider site={site}>
          <div className="pb-24">
            {children}
          </div>
          <BottomNav />
        </SiteProvider>
      </body>
    </html>
  );
}

