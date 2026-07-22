import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Pre-bundle the 3D stack together so dev mode resolves a single React copy
  // (three/fiber/drei were added after the first optimize pass).
  optimizeDeps: {
    include: ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei"],
  },
  resolve: {
    dedupe: ["react", "react-dom", "three"],
  },
});
