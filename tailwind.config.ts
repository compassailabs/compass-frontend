import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          deep: "var(--arc-deep)",
          mid: "var(--arc-mid)",
          bright: "var(--arc-bright)",
        },
        silver: {
          1: "var(--silver-1)",
          2: "var(--silver-2)",
          3: "var(--silver-3)",
          4: "var(--silver-4)",
          5: "var(--silver-5)",
        },
        mint: "var(--mint)",
        amber: "var(--amber)",
        steel: "var(--steel)",
        line: {
          1: "var(--line-1)",
          2: "var(--line-2)",
          3: "var(--line-3)",
        },
      },
      fontFamily: {
        display: ["var(--f-display)"],
        body: ["var(--f-body)"],
        mono: ["var(--f-mono)"],
      },
      borderRadius: {
        pill: "100px",
      },
      keyframes: {
        mintPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(127, 223, 183, 0.5)" },
          "70%": { boxShadow: "0 0 0 8px rgba(127, 223, 183, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(127, 223, 183, 0)" },
        },
        amberPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(232, 179, 57, 0.5)" },
          "70%": { boxShadow: "0 0 0 8px rgba(232, 179, 57, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(232, 179, 57, 0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        flightLine: {
          from: { opacity: "0", transform: "translateY(-3px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "mint-pulse": "mintPulse 2s ease-out infinite",
        "amber-pulse": "amberPulse 1.6s ease-out infinite",
        "blink": "blink 1.4s ease-in-out infinite",
        "spin-slow": "spinSlow 12s linear infinite",
        "spin-very-slow": "spinSlow 32s linear infinite",
        "flight-line": "flightLine 0.3s ease-out",
        "spin-fast": "spinSlow 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
