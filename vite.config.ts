import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

import { defineConfig } from "vite";

const TAKUMI_EXTERNALS = [
  "@takumi-rs/image-response",
  "@takumi-rs/core",
  "@takumi-rs/helpers",
];

export default defineConfig({
  plugins: [tanstackStart({ srcDirectory: "app" }), viteReact()],
  resolve: {
    alias: { "@": new URL("./src", import.meta.url).pathname },
  },
  ssr: {
    external: TAKUMI_EXTERNALS,
  },
});
