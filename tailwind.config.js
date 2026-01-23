/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          apricot: '#F2D1C9',
          cream: '#FFF5F5',
          mint: '#D4F1F4',
          azure: '#E8FAFC',
          lilac: '#DCD6F7',
          periwinkle: '#F4EEFF',
          gold: '#FBE7C6',
          vanilla: '#FFFCF2',
          pink: '#FBC4AB',
          blush: '#FDE2E4',
        },
        glass: {
          10: 'rgba(255, 255, 255, 0.1)',
          20: 'rgba(255, 255, 255, 0.2)',
          30: 'rgba(255, 255, 255, 0.3)',
          40: 'rgba(255, 255, 255, 0.4)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      dropShadow: {
        'glow': '0 0 10px rgba(255, 255, 255, 0.5)',
        'glow-strong': '0 0 20px rgba(255, 255, 255, 0.7)',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
