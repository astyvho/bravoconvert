/** @type {import('tailwindcss').Config} */
// Design tokens live as RGB-channel CSS variables in src/app/globals.css; this file only maps them
// to Tailwind names. Spec: docs/superpowers/specs/2026-11-12-site-redesign-design.md §5.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: { DEFAULT: token("card"), foreground: token("card-foreground") },
        popover: { DEFAULT: token("popover"), foreground: token("popover-foreground") },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
          hover: token("primary-hover"),
          soft: token("primary-soft"),
        },
        destructive: { DEFAULT: token("destructive"), foreground: token("destructive-foreground") },
        status: {
          found: { DEFAULT: token("status-found"), foreground: token("status-found-foreground") },
          clean: { DEFAULT: token("status-clean"), foreground: token("status-clean-foreground") },
        },
        tile: {
          blue: token("tile-blue"),
          yellow: token("tile-yellow"),
          green: token("tile-green"),
          pink: token("tile-pink"),
          peach: token("tile-peach"),
        },
        // Legacy accent palette, repointed to indigo so screens not yet redesigned pick up the new
        // point colour. Removed in redesign Phase 5.
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["52px", { lineHeight: "1.06", letterSpacing: "-0.035em", fontWeight: "800" }],
        h1: ["36px", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "800" }],
        h2: ["26px", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "800" }],
        h3: ["17px", { lineHeight: "1.3", fontWeight: "700" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "600" }],
      },
      borderRadius: {
        card: "24px",
        field: "16px",
        tile: "16px",
        "tile-sm": "12px",
      },
      // Named "soft"/"cta" rather than "card"/"primary": those would collide with Tailwind's
      // shadow-{color} utilities generated from the colour palette.
      boxShadow: {
        soft: "0 8px 30px rgba(120, 70, 20, 0.07)",
        cta: "0 6px 16px rgba(79, 70, 229, 0.25)",
      },
    },
  },
  plugins: [],
};
