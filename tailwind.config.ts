import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0a0a0a',
          dark: '#111111',
          card: '#161616',
          border: '#222222',
          pink: '#e91e8c',
          'pink-light': '#ff2d9c',
          'pink-glow': 'rgba(233,30,140,0.15)',
          white: '#ffffff',
          gray: '#888888',
          'gray-light': '#cccccc',
        },
      },
      fontFamily: {
        script: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient':
          'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,1) 100%)',
        'pink-glow':
          'radial-gradient(ellipse at center, rgba(233,30,140,0.2) 0%, transparent 70%)',
      },
      boxShadow: {
        'pink-glow': '0 0 30px rgba(233,30,140,0.3)',
        'pink-glow-sm': '0 0 15px rgba(233,30,140,0.2)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-in-out',
        'pulse-pink': 'pulsePink 2s cubic-bezier(0.4,0,0.6,1) infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulsePink: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(233,30,140,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(233,30,140,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
