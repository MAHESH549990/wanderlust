import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

const clientDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: clientDir,
  publicDir: false,
  base: "/",
  build: {
    outDir: path.resolve(clientDir, "../public/app"),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
