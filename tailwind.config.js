/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pine: { DEFAULT: '#6B54FD', deep: '#0D0056', soft: '#5A43E8' },
        mint: { DEFAULT: '#E9E5FF', soft: '#F4F2FF', line: '#DFDAFA' },
        paper: '#F9F8FF',
        ink: { DEFAULT: '#0D0056', soft: '#747281' },
        amber: { badge: '#9A6B00', soft: '#FFF3CF' },
        berry: '#E5484D',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,0,86,.06), 0 8px 24px -12px rgba(107,84,253,.16)',
        lift: '0 2px 4px rgba(13,0,86,.08), 0 18px 40px -16px rgba(107,84,253,.30)',
        drawer: '-24px 0 60px -20px rgba(13,0,86,.35)',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0) rotateX(12deg) rotateY(-18deg)' }, '50%': { transform: 'translateY(-7px) rotateX(10deg) rotateY(-14deg)' } },
        fadeUp: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        pop: { from: { opacity: 0, transform: 'scale(.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        floaty: 'floaty 5.5s ease-in-out infinite',
        fadeUp: 'fadeUp .5s cubic-bezier(.22,.61,.36,1) both',
        slideIn: 'slideIn .38s cubic-bezier(.22,.61,.36,1) both',
        pop: 'pop .28s cubic-bezier(.22,.61,.36,1) both',
      },
    },
  },
  plugins: [],
};
