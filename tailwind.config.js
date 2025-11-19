/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Restored Jarvis Palette
        bg: {
          DEFAULT: 'var(--color-bg)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          accent: 'var(--color-text-accent)',
          muted: 'var(--color-text-muted)',
          glow: 'var(--color-text-glow)',
        },
        jarvis: {
          primary: 'var(--color-jarvis-primary)',
          secondary: 'var(--color-jarvis-secondary)',
          accent: 'var(--color-jarvis-accent)',
          glow: 'var(--color-jarvis-glow)',
        },
        reactor: {
          core: 'var(--color-reactor-core)',
          ring: 'var(--color-reactor-ring)',
          DEFAULT: 'var(--color-reactor-core)', // Mapping for new components
          glow: 'var(--color-jarvis-glow)', // Mapping for new components
        },
        holo: {
          blue: 'var(--color-holo-blue)',
          cyan: 'var(--color-holo-cyan)',
          teal: 'var(--color-holo-teal)',
          emerald: 'var(--color-holo-emerald)',
        },
        panel: {
          bg: 'var(--color-panel-bg)',
          border: 'var(--color-panel-border)',
          hover: 'var(--color-panel-hover)',
        },
        glass: {
          bg: 'var(--color-glass-bg)',
          border: 'var(--color-glass-border)',
          DEFAULT: 'var(--color-glass-bg)', // Mapping for new components
          hover: 'var(--color-panel-hover)', // Mapping for new components
          heavy: 'var(--color-bg-secondary)', // Mapping for new components
        },

        // Mapping new color names to old variables for compatibility
        void: {
          DEFAULT: 'var(--color-bg)',
          lighter: 'var(--color-bg-secondary)',
          darker: '#000000',
        },
        cyan: {
          DEFAULT: 'var(--color-jarvis-primary)',
          dim: 'rgba(107, 163, 192, 0.4)',
          glow: 'var(--color-jarvis-glow)',
          neon: 'var(--color-jarvis-accent)',
        },
        violet: {
          DEFAULT: 'var(--color-jarvis-secondary)',
          dim: 'rgba(90, 141, 168, 0.4)',
          glow: 'var(--color-jarvis-secondary)',
          neon: 'var(--color-text-accent)',
        },
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'sans-serif'], // Rajdhani or Orbitron
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(107, 163, 192, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(107, 163, 192, 0.1) 1px, transparent 1px)',
        'void-gradient': 'radial-gradient(circle at center, #15161a 0%, #0f1012 100%)',
      },

      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse-slow': 'spin-reverse 25s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 1s ease-out',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
      },

      keyframes: {
        'spin-reverse': {
          'from': { transform: 'rotate(360deg)' },
          'to': { transform: 'rotate(0deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 243, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 243, 255, 0.8), 0 0 80px rgba(0, 243, 255, 0.4)' },
        },
        'slideUp': {
          'from': { transform: 'translateY(100px)', opacity: 0 },
          'to': { transform: 'translateY(0)', opacity: 1 },
        },
        'slideDown': {
          'from': { transform: 'translateY(-100px)', opacity: 0 },
          'to': { transform: 'translateY(0)', opacity: 1 },
        },
        'fadeIn': {
          'from': { opacity: 0 },
          'to': { opacity: 1 },
        },
        'scaleIn': {
          'from': { transform: 'scale(0.8)', opacity: 0 },
          'to': { transform: 'scale(1)', opacity: 1 },
        },
        'shimmer': {
          'from': { backgroundPosition: '0 0' },
          'to': { backgroundPosition: '-200% 0' },
        },
      },

      boxShadow: {
        'neon-blue': '0 0 10px rgba(0, 243, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3)',
        'neon-purple': '0 0 10px rgba(189, 0, 255, 0.5), 0 0 20px rgba(189, 0, 255, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [],
}

