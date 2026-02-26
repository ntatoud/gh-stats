import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tanstackStart({ srcDirectory: "app" }), viteReact()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  ssr: {
    // @takumi-rs/image-response uses @takumi-rs/core (native Node.js addon).
    // Keep them external so the platform-specific binary is loaded at runtime
    // from the node_modules copied alongside the bundle.
    external: ["@takumi-rs/image-response", "@takumi-rs/core", "@takumi-rs/helpers"],
  },
});
