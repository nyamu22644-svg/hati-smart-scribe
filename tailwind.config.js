/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/**/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./hoc/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /^(bg|text|border)-(navy|gold|crimson)/ },
    { pattern: /^(bg|text|border)-(white|slate)-(50|100|200|300|400|600)/ },
    { pattern: /^(bg)-(gold-premium|rose)-(50|500)/ },
    { pattern: /^(border)-(rose|gold)-(100|200|300)/ },
    { pattern: /^(text)-(rose|gold|gray)-(400|600|700)/ },
    { pattern: /^focus:ring-(gold)/ },
    { pattern: /^(bg-white|text-white|backdrop-blur)/ },
    { pattern: /^(hover|group-hover|active):/ },
    { pattern: /^translate/ },
    { pattern: /^-translate/ },
  ],
  theme: {
    extend: {
      colors: {
        navy: '#001f3f',
        gold: '#d4af37',
        crimson: '#dc143c',
        'gold-premium': '#d4af37',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
