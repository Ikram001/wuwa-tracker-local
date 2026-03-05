import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wuwa: {
          bg: "#000000",
          surface: "#0a0a0a",
          card: "#111111",
          border: "#1e1e1e",
          accent: "#7c6af7",
          gold: "#f5c842",
          silver: "#b06cff",
          bronze: "#5ba4ff",
          text: "#ffffff",
          muted: "#888888",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
