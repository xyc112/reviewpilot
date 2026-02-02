import { defineConfig } from "vite";
// @ts-expect-error - @vitejs/plugin-react type definitions may be missing
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
