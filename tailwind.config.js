/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#667eea',
        accent: '#764ba2',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        cantonese: ['Noto Sans HK', 'Hiragino Sans', 'sans-serif'],
      },
      spacing: {
        safe: 'max(1rem, env(safe-area-inset-top))',
      },
    },
  },
  plugins: [],
}
