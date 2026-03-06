import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // 🔗 CONNECT FRONTEND → BACKEND
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    target: "esnext",
    cssMinify: true,

    sourcemap: mode !== "production",

    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-motion": ["framer-motion"],
          "vendor-gsap": ["gsap"],
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],
        },
      },
    },

    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: ["framer-motion", "gsap", "react-router-dom"],
  },
}));
