/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pipe: {
          bg: "#ffffff",
          surface: "#f8f8fa",
          panel: "#ffffff",
          border: "#e5e7eb",
          "border-light": "#d1d5db",

          primary: "#f97316",
          "primary-bright": "#fb923c",
          "primary-dim": "#ea580c",
          "primary-wash": "#fff7ed",

          sky: "#0ea5e9",
          "sky-dim": "#0284c7",

          green: "#22c55e",
          "green-dim": "#16a34a",
          "green-wash": "#f0fdf4",

          amber: "#f59e0b",
          red: "#ef4444",
          "red-wash": "#fef2f2",

          text: "#111827",
          secondary: "#374151",
          muted: "#6b7280",
          dim: "#9ca3af",
          ghost: "#f3f4f6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        "glow-orange": "0 0 20px rgba(249,115,22,0.15), 0 0 60px rgba(249,115,22,0.05)",
      },
    },
  },
  plugins: [],
};
