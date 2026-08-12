import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        whatsapp: {
          DEFAULT: "hsl(var(--whatsapp))",
          foreground: "hsl(var(--whatsapp-foreground))",
        },
        status: {
          open: "hsl(var(--open))",
          closed: "hsl(var(--closed))",
          pending: "hsl(var(--pending))",
        },
        category: {
          food: "hsl(var(--food))",
          classifieds: "hsl(var(--classifieds))",
          deals: "hsl(var(--deals))",
          services: "hsl(var(--services))",
          events: "hsl(var(--events))",
          obituary: "hsl(var(--obituary))",
          news: "hsl(var(--news))",
        },
      },
      borderRadius: {
        "3xl": "1.5rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Interface e corpo de texto
        sans: ["Archivo", "ui-sans-serif", "system-ui", "sans-serif"],
        // Títulos: serifa variável com eixos SOFT/WONK
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        // Micro-labels, números e metadados
        mono: ["'Azeret Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      letterSpacing: {
        label: "0.18em",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      backgroundImage: {
        // Hachura diagonal fina, para faixas e cabeçalhos
        hatch:
          "repeating-linear-gradient(45deg, hsl(var(--foreground) / 0.07) 0 1px, transparent 1px 7px)",
        // Papel milimetrado suave
        grid:
          "linear-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        // Passo da malha `bg-grid`. Nome distinto para não colidir com a
        // classe gerada por `backgroundImage.grid`.
        "grid-cell": "22px 22px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.96)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Letreiro rolante do cabeçalho da home
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        // Brilho que percorre skeletons e selos
        sheen: {
          from: { transform: "translateX(-120%)" },
          to: { transform: "translateX(220%)" },
        },
        // Oscilação sutil de selos/carimbos
        sway: {
          "0%, 100%": { transform: "rotate(-2.5deg)" },
          "50%": { transform: "rotate(2.5deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce-in": "bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        marquee: "marquee 38s linear infinite",
        sheen: "sheen 2.4s ease-in-out infinite",
        sway: "sway 5s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;
