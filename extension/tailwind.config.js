/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: "#3d87cf",
        yellow: "#fac705",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: 0,
            transform: "translateY(-5px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};
