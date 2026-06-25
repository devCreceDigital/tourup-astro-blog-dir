/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f6e56',
        'primary-light': '#e1f5ee',
        'primary-dark': '#085041',
        accent: '#1d9e75',
        'neutral-bg': '#f5f4f0',
        'border-color': '#e2e0d8',
        'text-secondary': '#555',
        'text-muted': '#999',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
