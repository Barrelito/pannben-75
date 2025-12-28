import Link from "next/link";
import Logo from "@/components/ui/Logo";
import MobileContainer from "@/components/layout/MobileContainer";

export default function Home() {
  return (
    <MobileContainer>
      <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          {/* Logo */}
          <Logo />

          {/* Subheading */}
          <h2 className="font-inter text-xl md:text-2xl font-light text-primary tracking-wide uppercase">
            HÅRT ARBETE. SMART VILA.
          </h2>

          {/* CTA Button */}
          {/* CTA Button */}
          <Link
            href="/login"
            className="mt-8 px-8 py-4 bg-accent text-background font-inter font-semibold text-lg uppercase tracking-wider border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 inline-block"
          >
            LOGGA IN
          </Link>
        </div>
      </main>
    </MobileContainer>
  );
}
