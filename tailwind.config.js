/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Font chính cho UI
        roboto: ['Roboto', 'system-ui', 'sans-serif'],
        // Font cho design/branding
        miso: ['Miso', 'system-ui', 'sans-serif'],
        // Font digital cho số liệu/dashboard
        digital: ['Digital-7', 'monospace'],
        // Font chính
        inter: ['Inter', 'system-ui', 'sans-serif'],
        // Default sans-serif sử dụng Roboto
        sans: ['Roboto', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
      },
      keyframes: {
        slideDown: {
          from: {
            opacity: '0',
            maxHeight: '0',
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: '1',
            maxHeight: '500px',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
