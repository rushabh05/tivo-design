/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0f9f9', 100: '#d0eeee', 200: '#a1dddd',
          300: '#72cbcb', 400: '#4ab9b9', 500: '#2ea3a3',
          600: '#237f7f', 700: '#1a5f5f', 800: '#114040', 900: '#092020',
        },
        gold: {
          50: '#fdf9ed', 100: '#f9efc3', 200: '#f2da87',
          300: '#e9c04d', 400: '#d4a017', 500: '#b8860b',
          600: '#9a6f09', 700: '#7a5507', 800: '#5a3e05', 900: '#3a2803',
        },
        cream: {
          50: '#fefcf8', 100: '#fdf8ef', 200: '#faf0da',
          300: '#f5e4be', 400: '#edd4a0', 500: '#e2c07e',
        },
        warm: {
          50: '#faf9f7', 100: '#f3f1ec', 200: '#e8e4db',
          300: '#d9d3c6', 400: '#c6bcac', 500: '#b0a48f',
          600: '#8a7d6a', 700: '#6b6055', 800: '#4a4035', 900: '#2d251c',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0,0,0,0.06)',
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'elevated': '0 8px 40px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
