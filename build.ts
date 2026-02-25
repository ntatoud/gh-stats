import { $ } from "bun";

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

// Write Vercel output config
await Bun.write(
  `${OUTPUT}/config.json`,
  JSON.stringify({
    version: 3,
    routes: [{ src: "/(.*)", dest: "/" }],
  })
);

// Write function config (Node.js with Web API handler)
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
