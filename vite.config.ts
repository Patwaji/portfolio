import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // long-term caching: vendor churn doesn't invalidate app code
        manualChunks: {
          three: ["three"],
          gsap: ["gsap"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
