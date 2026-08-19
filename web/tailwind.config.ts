import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: {
            DEFAULT: "#FFC222",
            dark: "#E6A800",
          },
          black: "#0A0A0A",
          surface: "#111111",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem",
      },
      boxShadow: {
        lift: "0 24px 48px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;