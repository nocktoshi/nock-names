import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    assetsInclude: ["**/*.wasm"],
    // Avoid Vite prebundling these deps: their wasm loader relies on
    // `new URL('iris_wasm_bg.wasm', import.meta.url)` and prebundling can
    // rewrite the URL to /node_modules/.vite/deps/... while not emitting
    // the wasm asset (resulting in SPA fallback HTML + wrong MIME type).
    optimizeDeps: {
      exclude: ["@nockbox/iris-wasm", "@nockbox/iris-sdk"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      sourcemap: process.env.VITE_SOURCEMAP === "true",
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith(".wasm")) {
            res.setHeader("Content-Type", "application/wasm");
          }
          next();
        });
      },
    },
  };
});
