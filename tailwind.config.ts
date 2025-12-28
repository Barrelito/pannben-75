import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spartan Modern Design System
        background: "#0a0a0a", // Void Black
        surface: "#171717", // Dark Gray for cards
        primary: "#D4D4D8", // Zinc-300 - "Cold Steel" for text/borders
        accent: "#EAB308", // Yellow-500 - "Gold" for streaks/highlights
        "status-green": "#15803d", // Green-700 - Muted tactical green
        "status-yellow": "#a16207", // Yellow-700
        "status-red": "#b91c1c", // Red-700
      },
      fontFamily: {
        teko: ["var(--font-teko)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
