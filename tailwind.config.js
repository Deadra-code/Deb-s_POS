export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#13ec6d",
        "background-dark": "#102218",
        "neutral-dark": "#1a2e23",
        "neutral-card": "#162b1f",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
