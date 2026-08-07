/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aesthetic/wellness pastel & professional color palette
        aesthetic: {
          50: '#fbf9f8',   // Pure pastel warmth
          100: '#f6f1ee',  // Soft cream
          200: '#ecdfe0',  // Dusty rose tint
          300: '#dfc4c5',  // Blush pink
          400: '#cd9fa3',  // Rose gold accent
          500: '#b2747a',  // Warm berry/rose gold
          600: '#9d5d64',  // Deep professional berry
          700: '#82484f',  // Elegant burgundy
          800: '#6d3c42',
          900: '#5c3136',
        },
        sage: {
          50: '#f5f7f5',   // Soft minty white
          100: '#e6ebe7',  // Soft eucalyptus
          200: '#cedad0',  // Sage shadow
          300: '#a7bdae',  // Pale sage
          400: '#7ca087',  // Clinical sage
          500: '#5f826a',  // Deep sage accent
          600: '#4a6753',
          700: '#3e5345',
          800: '#334338',
          900: '#2b382f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
