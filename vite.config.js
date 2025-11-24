import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";
import path from "node:path";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),

    // 🗜️ Generate BOTH Brotli (.br) and Gzip (.gz) assets
    compression({ algorithm: "brotliCompress", ext: ".br" }),
    compression({ algorithm: "gzip", ext: ".gz" }),

    // 📊 Opens visual bundle report after build
    visualizer({ open: true }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@game": path.resolve(__dirname, "src/features/game"),
      "@resume": path.resolve(__dirname, "src/features/resume"),
      "@features": path.resolve(__dirname, "src/features"),
      "@app": path.resolve(__dirname, "src/app")
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    minify: "terser",
    terserOptions: { compress: { drop_console: true } },
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    fs: { strict: false },
  }
});