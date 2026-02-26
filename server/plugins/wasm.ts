import { defineNitroPlugin } from "nitropack/runtime";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initSync } from "@takumi-rs/wasm";

// Pre-initialize the WASM module synchronously at server startup.
// The @takumi-rs/image-response/wasm renderer uses a singleton:
// once wasm is set, all ImageResponse calls skip WASM loading.
// This avoids fetch() calls with relative/file:// URLs (not supported in Node.js).
export default defineNitroPlugin(() => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const bytes = readFileSync(join(__dirname, "takumi_wasm_bg.wasm"));
  initSync({ module: bytes });
});
