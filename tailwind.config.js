/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neon: {
                    DEFAULT: '#A3FF12',
                    50: '#E8FFB8',
                    100: '#DEFF9E',
                    200: '#CFFF6E',
                    300: '#BFFF3F',
                    400: '#B1FF28',
                    500: '#A3FF12',
                    600: '#82D600',
                    700: '#62A300',
                    800: '#437000',
                    900: '#233D00',
                },
                dark: {
                    DEFAULT: '#0f0f0f',
                    50: '#2a2a2a',
                    100: '#252525',
                    200: '#1f1f1f',
                    300: '#1a1a1a',
                    400: '#151515',
                    500: '#0f0f0f',
                    600: '#0c0c0c',
                    700: '#080808',
                    800: '#050505',
                    900: '#020202',
                },
                glass: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    light: 'rgba(255, 255, 255, 0.1)',
                    medium: 'rgba(255, 255, 255, 0.15)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'neon': '0 0 15px rgba(163, 255, 18, 0.3)',
                'neon-lg': '0 0 30px rgba(163, 255, 18, 0.4)',
                'neon-xl': '0 0 60px rgba(163, 255, 18, 0.2)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(163, 255, 18, 0.2), 0 0 20px rgba(163, 255, 18, 0.1)' },
                    '100%': { boxShadow: '0 0 20px rgba(163, 255, 18, 0.4), 0 0 60px rgba(163, 255, 18, 0.2)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-neon': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
            },
        },
    },
    plugins: [],
}
