import defaultTheme from "tailwindcss/defaultTheme";

module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontSize: {
      xs: [...defaultTheme.fontSize.xs],
      sm: ["0.825rem", "1.15rem"],
      base: [...defaultTheme.fontSize.base],
      lg: [...defaultTheme.fontSize.lg],
      xl: [...defaultTheme.fontSize.xl],
      "2xl": [...defaultTheme.fontSize["2xl"]],
      "3xl": [...defaultTheme.fontSize["3xl"]],
      "4xl": [...defaultTheme.fontSize["4xl"]],
      "5xl": [...defaultTheme.fontSize["5xl"]],
      "6xl": [...defaultTheme.fontSize["6xl"]],
      "7xl": [...defaultTheme.fontSize["7xl"]],
      "8xl": [...defaultTheme.fontSize["8xl"]],
      "9xl": [...defaultTheme.fontSize["9xl"]],
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-gradient-mask-image"),
  ],
};
