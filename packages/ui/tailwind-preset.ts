import type { Config } from "tailwindcss";

/**
 * Shared Tailwind preset. Each app does:
 *
 *   import preset from "@szhms/ui/tailwind-preset";
 *   export default { presets: [preset], content: [...] } satisfies Config;
 *
 * Colours map to the CSS variables defined in `src/styles/globals.css`, so
 * tenant theming happens purely at the CSS-variable layer.
 */
const preset = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          fg: "rgb(var(--color-primary-fg) / <alpha-value>)",
        },
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          fg: "rgb(var(--color-muted-fg) / <alpha-value>)",
        },
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        panel: "0 1px 3px 0 rgb(15 23 42 / 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Omit<Config, "content">;

export default preset;
