/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F1322',       // Premium deep navy dark background
          card: '#181F38',     // Sleek card background
          border: '#242F50',   // High-contrast clean dark border
          input: '#1D2644',    // Input field color
        },
        brand: {
          primary: '#3B82F6',  // Vibrant modern blue
          secondary: '#8B5CF6',// Royal purple/indigo
          success: '#10B981',  // Pure emerald green
          warning: '#F59E0B',  // Rich amber
          danger: '#EF4444',   // Intense red
          gray: '#94A3B8'      // Slate gray text
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
