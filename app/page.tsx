import Link from "next/link";
import Logo from "@/components/ui/Logo";
import MobileContainer from "@/components/layout/MobileContainer";

export default function Home() {
  return (
    <MobileContainer>
      <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-[#0a0a0a] text-white">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center gap-2 text-center max-w-md mx-auto">

          {/* Logo/Icon Placeholder if needed, otherwise just text */}
          <div className="mb-8 p-6 rounded-full border border-yellow-500/20 bg-yellow-500/5">
            <div className="w-16 h-16 border-2 border-yellow-500 rounded-full flex items-center justify-center">
              <span className="font-teko text-3xl text-yellow-500 pt-1">75</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="font-teko text-7xl font-bold tracking-tight text-white leading-[0.8]">
            PANNBEN<span className="text-yellow-500">75</span>
          </h1>

          {/* Slogan */}
          <h2 className="font-teko text-2xl text-white/80 tracking-widest uppercase mt-4 mb-2">
            75 DAGAR. INGA URSÄKTER.
          </h2>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-600 to-transparent mb-6 opacity-50"></div>

          {/* Description */}
          <p className="font-inter text-sm text-white/50 leading-relaxed mb-12 max-w-xs">
            Detta är inte för alla. Det är ett test av din vilja, din disciplin och din uthållighet. Det kommer att vara jobbigt. Det är poängen.
          </p>

          {/* Actions */}
          <div className="flex flex-col w-full gap-4">
            <Link
              href="/login?view=signup"
              className="w-full py-4 bg-yellow-600 text-black font-teko text-xl font-bold uppercase tracking-widest hover:bg-yellow-500 transition-all duration-300"
            >
              Börja Utmaningen
            </Link>

            <Link
              href="/login"
              className="w-full py-4 bg-transparent border border-white/20 text-white/60 font-teko text-xl uppercase tracking-widest hover:text-white hover:border-white/40 transition-all duration-300"
            >
              Logga In
            </Link>
          </div>

          <p className="mt-8 text-[10px] text-white/20 font-inter uppercase tracking-widest">
            Bygg din karaktär
          </p>
        </div>
      </main>
    </MobileContainer>
  );
}
