/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        court: {
          bg: "#07070e",
          panel: "#0e0e1a",
          surface: "#141425",
          border: "#1e1e35",
          gold: "#c9a84c",
          "gold-dim": "#8a7333",
          silver: "#8a8aa0",
          red: "#e74c3c",
          green: "#2ecc71",
          blue: "#3498db",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out",
        gavel: "gavel 0.4s ease-out",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gavel: {
          "0%": { transform: "rotate(-30deg) scale(1.2)" },
          "60%": { transform: "rotate(5deg) scale(1)" },
          "100%": { transform: "rotate(0deg) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
