/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary luxury palette
        gold: {
          50:  '#fdf9ed',
          100: '#faf0c8',
          200: '#f5de8e',
          300: '#f0c84d',
          400: '#eab226',
          500: '#d4940f',  // Rich gold
          600: '#b8730a',  // Deep gold (amber-600 equivalent)
          700: '#8f5208',
          800: '#754209',
          900: '#63370c',
        },
        rose: {
          50:  '#fff1f3',
          100: '#ffe4e8',
          200: '#ffccd4',
          300: '#ffa1b3',
          400: '#ff6b8a',
          500: '#f43f65',
          600: '#e11d48',  // Vibrant rose
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        burgundy: {
          50:  '#fdf2f5',
          100: '#fbe8ee',
          200: '#f7d2de',
          300: '#f1aec4',
          400: '#e87da0',
          500: '#dc5079',
          600: '#c93060',
          700: '#9c2249',  // Deep burgundy
          800: '#722F37',  // Classic burgundy
          900: '#62172a',
          950: '#3d0c18',
        },
        sage: {
          50:  '#f5f7f4',
          100: '#e8ede5',
          200: '#d2dccc',
          300: '#afc3a6',
          400: '#87a47c',
          500: '#68895c',
          600: '#516d47',  // Sage green
          700: '#415737',
          800: '#36472f',
          900: '#2d3b28',
        },
        cream: {
          50:  '#fdfdf9',
          100: '#fbf9f0',
          200: '#f7f1dc',
          300: '#f0e4bb',
          400: '#e7d08f',
          500: '#dcb967',
        },
        charcoal: '#2C2C2C',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4940f 0%, #b8730a 50%, #8f5208 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #722F37 0%, #9c2249 50%, #722F37 100%)',
        'hero-gradient': 'linear-gradient(180deg, rgba(44,44,44,0.7) 0%, rgba(44,44,44,0.4) 50%, rgba(44,44,44,0.8) 100%)',
      },
      boxShadow: {
        'luxury': '0 4px 30px rgba(212, 148, 15, 0.15)',
        'card': '0 2px 20px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
};
