import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wuwa: {
          bg: "#0d0f1a",
          surface: "#131626",
          card: "#1a1f35",
          border: "#252a45",
          accent: "#7c6af7",
          gold: "#f5c842",
          silver: "#b06cff",
          bronze: "#5ba4ff",
          text: "#e2e6ff",
          muted: "#6b7299",
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
