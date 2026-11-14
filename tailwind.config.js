/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F6',
        ink: '#1E293B',
        forest: { 50: '#EEF5F0', 100: '#D6E8DC', 300: '#7FB394', 500: '#2E7D57', 600: '#24664A', 700: '#1C523C', 800: '#163F2F', 900: '#0F2E22' },
        clay: { 50: '#FBF1EB', 100: '#F5DDCF', 300: '#E3A07F', 500: '#C2643C', 600: '#A84F2C', 700: '#8A3F22' },
        sand: { 100: '#F3EBDD', 200: '#E9DCC6', 300: '#D9C4A3' },
        berry: '#B4383C',
      },
      fontFamily: {
        display: ['Nunito', 'system-ui', 'sans-serif'],
        mk: ['"Noto Sans"', 'Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        tactile: '0 4px 0 0 rgba(15,46,34,0.25)',
        'tactile-clay': '0 4px 0 0 #8A3F22',
        'tactile-forest': '0 4px 0 0 #0F2E22',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(.9)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        fall: { '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: 1 }, '100%': { transform: 'translateY(110vh) rotate(540deg)', opacity: 0.8 } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: { pop: 'pop .25s ease-out', shake: 'shake .35s ease-in-out', fall: 'fall 2.8s linear forwards', float: 'float 3s ease-in-out infinite' },
    },
  },
  plugins: [],
};
