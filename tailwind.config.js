export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: 'class', // Use class strategy for dark mode
  theme: {
    extend: {
      screens: {
        'xs': '400px',
      },
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#FFE66D',
          foreground: '#2d3436',
        },
        destructive: {
          DEFAULT: '#FF4757',
          foreground: '#ffffff',
        },
        background: '#f5f5f7', // Light mode background
        foreground: '#333333', // Light mode text
        muted: {
          DEFAULT: '#8c9396', // Lightened muted color
          foreground: '#333333', // Darkened foreground for contrast
        },
        border: '#d1d8dc', // Lightened border color
        ring: '#81ecec',
      },
      fontFamily: {
        sans: ['Comic Neue', 'Inter', 'sans-serif'],
        display: ['Luckiest Guy', 'Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'bounce': 'bounce 1s infinite',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%': { transform: 'none', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}