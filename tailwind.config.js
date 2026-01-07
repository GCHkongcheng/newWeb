/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        primary: "#667eea",
        secondary: "#764ba2",
      },
    },
  },
  plugins: [],
};
