/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#1A1D23',
          secondary: '#24282F',
          tertiary: '#2A2F38',
          quaternary: '#31363F',
        },
        aqua: {
          primary: '#2DD4BF',
          secondary: '#5EEAD4',
        }
      },
      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      }
    },
  },
  plugins: [],
}