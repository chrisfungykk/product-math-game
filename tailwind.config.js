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
        // Per-mode accents
        practice: '#2563eb', // blue
        timed: '#ef4444', // red
        blind: '#7c3aed', // purple
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        cantonese: ['Noto Sans HK', 'Hiragino Sans', 'sans-serif'],
      },
      spacing: {
        safe: 'max(1rem, env(safe-area-inset-top))',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        pop: 'pop 0.25s ease-out',
        fadeUp: 'fadeUp 0.35s ease-out',
      },
    },
  },
  plugins: [],
}
