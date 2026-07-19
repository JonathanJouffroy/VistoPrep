import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16232E",
        canvas: "#F7F8FA",
        structural: "#EEF1F4",
        structural2: "#DDE3E9",
        blue: {
          deep: "#1B3654",
          mid: "#2F4F6E",
          soft: "#5C7A96",
        },
        amber: {
          DEFAULT: "#E0954B",
          soft: "#F3D5AF",
          deep: "#B96F2C",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(22, 35, 46, 0.06), 0 8px 24px -12px rgba(22, 35, 46, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
