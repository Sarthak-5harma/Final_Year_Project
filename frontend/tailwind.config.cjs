/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      /* — brand colours you’re already using — */
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          50:  '#eef4ff',
          100: '#dbe5ff',
          200: '#b9caff',
          300: '#95adff',
          400: '#6c8aff',
          500: '#4665ff',
          600: '#2d48f6',
          700: '#1e34d3',
          800: '#1628ab',
          900: '#121f82',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate')   // ↖ make sure the package is installed
  ],
};
