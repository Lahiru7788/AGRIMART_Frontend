import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'poppins-black': ['Poppins Black', 'sans-serif'],
        'poppins-bold': ['Poppins Bold', 'sans-serif'],
        'poppins-regular': ['Poppins Regular', 'sans-serif'],
        'poppins-light': ['Poppins Light', 'sans-serif'],
        'coiny': ['Coiny', 'sans-serif'],
        'syne-bold': ['Syne Bold', 'sans-serif'],
        'syne-light': ['Syne Light', 'sans-serif'],

      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(to right, rgba(10, 191, 48, 0.33), #22242f 30%)',

      },
    },
  },
  plugins: [],
} satisfies Config;
