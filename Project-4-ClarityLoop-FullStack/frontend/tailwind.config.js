/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070B16',
          900: '#0B1120',
          850: '#0F1626',
          800: '#131C2E',
          750: '#172033',
          700: '#1B2538',
          600: '#243044',
          500: '#2E3B52',
        },
        accent: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
          violet: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.18)',
        card: '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px -8px rgba(0,0,0,0.4)',
        glow: '0 0 0 1px rgba(59,130,246,0.25), 0 8px 28px -6px rgba(59,130,246,0.25)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out both',
        scaleIn: 'scaleIn 0.18s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
