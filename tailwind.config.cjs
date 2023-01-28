/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'paintBgImg': "url('/src/assets/bgImg.png')"
      }
    },
    cursor: {
      crosshair: 'crosshair'
    }
  },
  plugins: [],
}
