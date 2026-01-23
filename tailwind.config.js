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
          peach: '#FFDAB9',
          mint: '#E0F2F1', // More subtle mint
          lavender: '#E6E6FA',
          sky: '#E1F5FE', // Very light blue
          rose: '#FCE4EC', // Very light pink
          cream: '#FFFDD0',
          sand: '#F5E6D3',
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
      }
    },
  },
  plugins: [],
}
