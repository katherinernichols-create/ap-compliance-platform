/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand colours
        kora: {
          coral: "#E06060",
          teal: "#20A080",
          "deep-teal": "#004040",
          "mid-teal": "#208080",
        },
        // Neutrals
        "kora-black": "#1A1A1A",
        "kora-grey": "#E0E0E0",
        "kora-white": "#FFFFFF",

        // Semantic / functional
        "kora-success": "#20A080", // teal
        "kora-warning": "#E0A040", // amber
        "kora-error": "#E06060",   // coral as error
        "kora-info": "#208080",    // mid teal
      },

      fontFamily: {
        sans: ["Inter", "Roboto", "system-ui", "sans-serif"],
      },

      fontSize: {
        xs: ["12px", { lineHeight: "1.4" }],
        sm: ["14px", { lineHeight: "1.4" }],
        base: ["16px", { lineHeight: "1.5" }],
        lg: ["20px", { lineHeight: "1.4" }],
        xl: ["28px", { lineHeight: "1.3" }],
      },

      borderRadius: {
        "kora-sm": "4px",
        "kora-md": "6px",
        "kora-lg": "8px",
        "kora-xl": "12px",
      },

      boxShadow: {
        "kora-sm": "0 1px 2px rgba(0,0,0,0.04)",
        "kora-md": "0 2px 8px rgba(0,0,0,0.08)",
        "kora-lg": "0 8px 20px rgba(0,0,0,0.12)",
      },

      spacing: {
        2: "2px",
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        24: "24px",
        32: "32px",
      },
    },
  },
  plugins: [],
};
