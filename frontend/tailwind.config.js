/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        "ink-soft": "#1B2740",
        "ink-border": "#2A3A5C",
        paper: "#F1F4F9",
        surface: "#FFFFFF",
        border: "#E3E8F0",
        brand: "#14B8A6",
        "brand-dim": "#CFF7F1",
        "brand-deep": "#0D9488",
        safe: "#16a34a",
        suspicious: "#D97706",
        danger: "#dc2626",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        scanline: "scanline 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};