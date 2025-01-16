export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Brand or legacy colors (kept for references, but recommended to unify usage below)
        deepBlue: '#004AAD',
        lightBlue: '#5DE0E6',

        // New standardized tokens
        primary: {
          DEFAULT: '#004AAD',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },
        // We can define a basic "foreground" and "background" if needed:
        foreground: '#000000',
        background: '#F8F9FA',
        input: '#F1F3F5',
        border: '#E2E8F0',
        ring: '#C9D1D9',
        'muted-foreground': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        handwriting: ['Shadows Into Light', 'cursive'],
      },
    },
  },
  plugins: [],
};