import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

// In the SSR build, Rollup/Vite can't handle .wasm files natively.
// This plugin intercepts .wasm imports in SSR and inlines the bytes as an ArrayBuffer.
// @takumi-rs/image-response/wasm's init accepts ArrayBuffer via WebAssembly.instantiate().
function ssrWasmPlugin(): Plugin {
  return {
    name: "ssr-wasm-inline",
    apply: "build",
    applyToEnvironment(env) {
      return env.name === "ssr";
    },
    load(id) {
      if (!id.endsWith(".wasm")) return;
      const bytes = readFileSync(id);
      const base64 = bytes.toString("base64");
      return `const b = Buffer.from("${base64}", "base64"); export default b.buffer;`;
    },
  };
}

// Post-process the Vercel function bundle to inline any remaining WASM references
// as base64 data URLs (safety net — should be a no-op after ssrWasmPlugin inlines them).
function inlineWasmPlugin(): Plugin {
  return {
    name: "inline-wasm-as-data-url",
    apply: "build",
    closeBundle() {
      const functionsDir = ".vercel/output/functions";
      if (!existsSync(functionsDir)) return;

      for (const funcName of readdirSync(functionsDir)) {
        const funcDir = join(functionsDir, funcName);
        const bundlePath = join(funcDir, "index.mjs");
        if (!existsSync(bundlePath)) continue;

        const wasmFiles = readdirSync(funcDir).filter((f) => f.endsWith(".wasm"));
        if (wasmFiles.length === 0) continue;

        let bundle = readFileSync(bundlePath, "utf-8");
        for (const wasmFile of wasmFiles) {
          const wasmBytes = readFileSync(join(funcDir, wasmFile));
          const dataUrl = `data:application/wasm;base64,${wasmBytes.toString("base64")}`;
          bundle = bundle.replaceAll(`"./${wasmFile}"`, JSON.stringify(dataUrl));
          rmSync(join(funcDir, wasmFile));
          console.log(`[inline-wasm] Inlined ${wasmFile} (${(wasmBytes.length / 1024 / 1024).toFixed(1)}MB)`);
        }
        writeFileSync(bundlePath, bundle);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    tanstackStart({ srcDirectory: "app" }),
    viteReact(),
    ssrWasmPlugin(),
    inlineWasmPlugin(),
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
