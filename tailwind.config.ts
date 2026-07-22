import type { Config } from "tailwindcss";

/**
 * Streamline Connex design tokens.
 * Premium B2B: deep ink navy, warm paper neutrals, one confident signal accent.
 * Deliberately restrained — credible and consultative, not startup-gimmicky.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1522",
          900: "#0B1522",
          800: "#111f31",
          700: "#1b2c42",
          600: "#2a3d56",
        },
        paper: {
          DEFAULT: "#FBFAF7",
          soft: "#F4F2EC",
          line: "#E7E3D9",
        },
        signal: {
          DEFAULT: "#1F6FEB",
          600: "#1a5fd0",
          50: "#EAF1FD",
        },
        emerald: {
          DEFAULT: "#0E9F6E",
          50: "#E6F6F0",
        },
        amber: {
          DEFAULT: "#B7791F",
          50: "#FBF3E2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      maxWidth: {
        content: "72rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,21,34,0.04), 0 12px 32px -12px rgba(11,21,34,0.14)",
        lift: "0 2px 4px rgba(11,21,34,0.06), 0 24px 48px -18px rgba(11,21,34,0.22)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
