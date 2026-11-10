/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { ink: "#081426", panel: "#101f35", accent: "#55d6e8" }, fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] } } },
  plugins: []
};