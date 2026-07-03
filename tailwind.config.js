/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        club: {
          DEFAULT: "#9a18d6",
          dark: "#360946",
          light: "#b80de8",
        },
      },
    },
  },
  plugins: [],
};
