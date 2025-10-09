import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  base: "/Introduction/",
  resolve: {
    alias: {
      "@game": path.resolve(__dirname, "src/features/game"),
      "@resume": path.resolve(__dirname, "src/features/resume"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@app": path.resolve(__dirname, "src/app")
    }
  }
});