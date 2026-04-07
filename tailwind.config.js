/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6a1b9a',
        secondary: '#ab47bc',
        accent: '#f3e5f5',
      },
    },
  },
  plugins: [],
}
