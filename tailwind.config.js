/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#060c1a',
          800: '#0d1526',
          700: '#111e35',
          600: '#1a2745',
          500: '#1e2d45',
        }
      }
    },
  },
  plugins: [],
}