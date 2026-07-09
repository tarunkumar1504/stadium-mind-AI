/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // supports manual toggle and accessibility high-contrast
  theme: {
    extend: {
      colors: {
        fifa: {
          dark: '#030712',      // Deep space background
          card: 'rgba(17, 24, 39, 0.7)', // Glassmorphic background
          green: '#10B981',     // Pitch green
          blue: '#1E40AF',      // Classic blue
          gold: '#F59E0B',      // Championship gold
          red: '#EF4444'        // Red cards / critical
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
