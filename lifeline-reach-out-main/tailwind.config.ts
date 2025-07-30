import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					glow: 'hsl(var(--secondary-glow))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					glow: 'hsl(var(--accent-glow))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				glass: {
					bg: 'hsl(var(--glass-bg))',
					border: 'hsl(var(--glass-border))',
				},
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-glass': 'var(--gradient-glass)',
			},
			boxShadow: {
				'glass': 'var(--shadow-glass)',
				'glow': 'var(--shadow-glow)',
				'emergency': 'var(--shadow-emergency)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backdropBlur: {
				'glass': '16px',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' },
				},
				// Enhanced Fade Animations
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-out-down': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(20px)' },
				},
				// Slide Animations
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(100%)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-down': {
					'0%': { opacity: '0', transform: 'translateY(-100%)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'slide-in-bottom': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' },
				},
				// Scale Animations
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				// Emergency Pulse Animation
				'pulse': {
					'0%, 100%': { 
						transform: 'scale(1)',
						opacity: '1',
					},
					'50%': { 
						transform: 'scale(1.05)',
						opacity: '0.8',
					},
				},
				'pulse-emergency': {
					'0%, 100%': { 
						transform: 'scale(1)',
						boxShadow: '0 0 0 0 hsl(var(--destructive) / 0.7)',
					},
					'50%': { 
						transform: 'scale(1.02)',
						boxShadow: '0 0 0 10px hsl(var(--destructive) / 0)',
					},
				},
				'pulse-glow': {
					'0%, 100%': { 
						transform: 'scale(1)',
						boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
					},
					'50%': { 
						transform: 'scale(1.05)',
						boxShadow: '0 0 40px hsl(var(--primary) / 0.6)',
					},
				},
				// Map Marker Drop Animation
				'drop-in': {
					'0%': { 
						opacity: '0',
						transform: 'translateY(-50px) scale(0.8)',
					},
					'60%': { 
						opacity: '1',
						transform: 'translateY(5px) scale(1.1)',
					},
					'100%': { 
						opacity: '1',
						transform: 'translateY(0) scale(1)',
					},
				},
				'bounce-pin': {
					'0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
					'40%': { transform: 'translateY(-10px)' },
					'60%': { transform: 'translateY(-5px)' },
				},
				// Enhanced Shimmer Loading
				'shimmer': {
					'0%': { 
						backgroundPosition: '-200% 0',
						opacity: '0.6',
					},
					'50%': {
						opacity: '1',
					},
					'100%': { 
						backgroundPosition: '200% 0',
						opacity: '0.6',
					},
				},
				'skeleton-pulse': {
					'0%, 100%': { opacity: '0.6' },
					'50%': { opacity: '1' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Enhanced Fade Animations (0.4s as requested)
				'fade-in': 'fade-in 0.4s ease-out',
				'fade-out': 'fade-out 0.4s ease-out',
				'fade-in-up': 'fade-in-up 0.4s ease-out',
				'fade-out-down': 'fade-out-down 0.4s ease-out',
				// Slide Animations
				'slide-up': 'slide-up 0.5s ease-out',
				'slide-down': 'slide-down 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
				// Scale Animation
				'scale-in': 'scale-in 0.2s ease-out',
				// Emergency Pulse Animations
				'pulse': 'pulse 2s ease-in-out infinite',
				'pulse-emergency': 'pulse-emergency 2s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				// Map Marker Animation
				'drop-in': 'drop-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'bounce-pin': 'bounce-pin 1s ease-in-out',
				// Loading Animations
				'shimmer': 'shimmer 2s linear infinite',
				'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'spring': 'var(--transition-spring)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
