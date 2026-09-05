/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        border: "var(--border)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        
        // shadcn/ui defaults remapped to our tokens where applicable
        background: "var(--bg)",
        foreground: "var(--text)",
        muted: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-muted)",
        },
        popover: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        input: "var(--border)",
        ring: "var(--primary)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        xs: ["12px", "1.4"],
        sm: ["13px", "1.4"],
        base: ["14px", "1.4"],
        lg: ["16px", "1.2"],
        xl: ["20px", "1.2"],
        "2xl": ["24px", "1.2"],
        "3xl": ["32px", "1.2"],
      },
      spacing: {
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        24: "24px",
        32: "32px",
        48: "48px",
        64: "64px",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,var(--shadow-alpha-sm))",
        md: "0 8px 24px rgba(0,0,0,var(--shadow-alpha-md))",
        lg: "0 16px 48px -12px rgba(0,0,0,var(--shadow-alpha-lg))",
      },
    },
  },
  plugins: [],
}
