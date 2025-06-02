/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // adjust paths based on your project
  ],
    theme: {
      extend: {
        colors: {
          vibrantOrange: "#F15A29",   // primary
          softPeach: "#F7C59F",       // highlight
          lightOrange: "#fff1d6",      // background
          deepGreen: "#1D2634",       // structural       /
          softOrange:"#ffeae3"
        }
      }
    },
  plugins: [],
}
