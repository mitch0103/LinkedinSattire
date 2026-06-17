/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F3F2EF",
        ink: "#1B1F23",
        linkedin: "#0A66C2",
        linkedinDark: "#004182",
        muted: "#666666",
        hairline: "#E5E3DF",
        highlight: "#FFE14D",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
