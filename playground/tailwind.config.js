const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        muted: colors.gray,
      },
      backgroundImage: {
        'congratulation-bg': "url('/test2.jpg')",
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
