import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()], // 确保这行存在
<<<<<<< HEAD
  base: './',
=======
>>>>>>> 48f166dbb3d90e8ea4023d022aee3928b93eb945
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false, // 添加这个选项
        rewrite: (path) => path // 确保路径正确
      }
    }
  }
});