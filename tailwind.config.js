/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // MS PICK 메인 색: 보라빛 인디고
        brand: {
          50: '#f2f1ff',
          100: '#e5e3ff',
          200: '#cdc8ff',
          300: '#aaa1ff',
          400: '#8a7dff',
          500: '#6d5cff',
          600: '#5a43f5',
          700: '#4a34d6',
          800: '#3b2aa8',
          900: '#271c6e',
        },
        // 포인트 색: 'PICK' 체크 표시
        pick: {
          400: '#3ee0b0',
          500: '#16c995',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 4px 16px -8px rgb(15 23 42 / 0.08)',
      },
    },
  },
  plugins: [],
};
