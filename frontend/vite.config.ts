import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      process: "process/browser",
      util: "util",
    },
  },
  build: {
    rollupOptions: {
      external: [
        "@safe-globalThis/safe-apps-provider",
        "@safe-globalThis/safe-apps-sdk",
      ],
    },
  },
  plugins: [react()],
});
