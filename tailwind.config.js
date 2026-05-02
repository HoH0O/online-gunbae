/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateX(-25%) rotate(0deg)' },
          '50%': { transform: 'translateX(-25%) rotate(2deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.4)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        rotatePhone: {
          '0%, 30%, 100%': { transform: 'rotate(-90deg)' },
          '60%, 80%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        wave: 'wave 2.5s ease-in-out infinite',
        sparkle: 'sparkle 1.6s ease-in-out infinite',
        marquee: 'marquee 22s linear infinite',
        'rotate-phone': 'rotatePhone 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
