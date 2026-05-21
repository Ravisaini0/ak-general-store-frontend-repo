export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#facc15",
        dark: "#111827",
        orange: "#f97316",
        ink: "#151515",
        cream: "#fffdf4",
      },
      boxShadow: {
        soft: "0 16px 40px rgba(17, 24, 39, 0.08)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
    },
  },
  plugins: [],
};
