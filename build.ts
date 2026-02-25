import { $ } from "bun";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join, basename } from "node:path";

const OUTPUT = ".vercel/output";
const FUNC_DIR = `${OUTPUT}/functions/index.func`;

// Clean previous output
await $`rm -rf ${OUTPUT}`;
await $`mkdir -p ${FUNC_DIR}`;

// Bundle the Vercel entry point for Node.js
const result = await Bun.build({
  entrypoints: ["src/vercel.ts"],
  outdir: FUNC_DIR,
  target: "node",
  naming: "index.mjs",
});

if (!result.success) {
  console.error("Build failed:", result.logs);
  process.exit(1);
}

// Post-process: inline WASM as a data URL so Node.js fetch() can load it.
// Bun emits .wasm as a separate file and the bundle references it as a
// relative string (e.g. "./takumi_wasm_bg-abc123.wasm"). Node.js fetch()
// rejects relative URLs, but fetch("data:application/wasm;base64,...") works.
const wasmOutputs = result.outputs.filter((o) => o.path.endsWith(".wasm"));
for (const wasmOutput of wasmOutputs) {
  const wasmBytes = readFileSync(wasmOutput.path);
  const dataUrl = `data:application/wasm;base64,${wasmBytes.toString("base64")}`;

  const bundlePath = join(FUNC_DIR, "index.mjs");
  let bundle = readFileSync(bundlePath, "utf-8");

  const wasmRef = JSON.stringify(`./${basename(wasmOutput.path)}`);
  bundle = bundle.replaceAll(wasmRef, JSON.stringify(dataUrl));

  writeFileSync(bundlePath, bundle);
  unlinkSync(wasmOutput.path);

  console.log(`Inlined ${basename(wasmOutput.path)} (${(wasmBytes.length / 1024 / 1024).toFixed(1)}MB) as data URL`);
}

// Write Vercel output config
await Bun.write(
  `${OUTPUT}/config.json`,
  JSON.stringify({
    version: 3,
    routes: [{ src: "/(.*)", dest: "/" }],
  })
);

// Write function config (Node.js runtime)
await Bun.write(
  `${FUNC_DIR}/.vc-config.json`,
  JSON.stringify({
    runtime: "nodejs22.x",
    handler: "index.mjs",
    launcherType: "Nodejs",
    supportsResponseStreaming: true,
  })
);

console.log("Build complete → .vercel/output/");
