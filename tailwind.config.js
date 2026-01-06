/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium silver-lavender palette
        lavender: {
          50: '#faf9fc',
          100: '#f4f2f8',
          200: '#ebe7f2',
          300: '#dcd5e9',
          400: '#c4b8db',
          500: '#a996c9',
          600: '#9280b4',
          700: '#7d6a9c',
          800: '#685880',
          900: '#564a69',
          950: '#362f44',
        },
        silver: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
          950: '#121212',
        },
        metallic: {
          light: '#e8e4ef',
          DEFAULT: '#c9c2d4',
          dark: '#9990a8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 8px rgba(201, 194, 212, 0.6))' },
          '100%': { filter: 'drop-shadow(0 0 20px rgba(201, 194, 212, 0.9))' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
