/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        fontFamily: {
        'roboto-flex': ['"Roboto Flex"', 'sans-serif'],
        'glory': ['Glory', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
