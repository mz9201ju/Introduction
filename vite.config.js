import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [react(), compression({ algorithm: "brotliCompress" })],
  base: "/",
  resolve: {
    alias: {
      "@game": path.resolve(__dirname, "src/features/game"),
      "@resume": path.resolve(__dirname, "src/features/resume"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@app": path.resolve(__dirname, "src/app")
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            return "vendor";
          }
        }
      }
    }
  },
  server: {
    historyApiFallback: false,
    fs: { strict: false },
  },
  preview: {
    historyApiFallback: true, // ✅ this works for `vite preview` (post-build)
  },
});