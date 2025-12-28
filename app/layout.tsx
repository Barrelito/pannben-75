import type { Metadata } from "next";
import { Teko, Inter } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${teko.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
