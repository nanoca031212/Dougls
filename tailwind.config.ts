import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "var(--font-nunito-sans)",
          "Inter",
          "Nunito Sans",
          "Avenir Next",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif"
        ],
        mono: [
          "var(--font-inter)",
          "var(--font-nunito-sans)",
          "Inter",
          "Nunito Sans",
          "Avenir Next",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "monospace"
        ],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;