import { $ } from "bun";
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const OUTPUT = ".vercel/output";
const FUNC_DIR = `${OUTPUT}/functions/index.func`;

// Step 1: Run vite build (generates dist/server/server.js + dist/client/)
await $`bun x vite build`;

// Step 2: Set up output directory
rmSync(OUTPUT, { recursive: true, force: true });
mkdirSync(FUNC_DIR, { recursive: true });

// Step 3: Write a thin Node.js adapter that wraps the TanStack Start fetch handler.
// Vercel's launcherType:"Nodejs" sends IncomingMessage/ServerResponse, not Web API Request/Response.
const ADAPTER = join(FUNC_DIR, "_adapter.mjs");
await Bun.write(
  ADAPTER,
  `import server from "../../../../dist/server/server.js";
export default async function handler(req, res) {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", "https://" + host);
  const headers = new Headers(req.headers);
  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";
  const request = new Request(url, {
    method,
    headers,
    body: hasBody ? req : null,
    duplex: "half",
  });
  const response = await server.fetch(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const buffer = await response.arrayBuffer();
  res.end(Buffer.from(buffer));
}
`
);

// Step 4: Bundle the adapter (+ dist/server/server.js + all its dynamic asset imports) with Bun
const result = await Bun.build({
  entrypoints: [ADAPTER],
  outdir: FUNC_DIR,
  target: "node",
  naming: "index.mjs",
  // Include dynamic imports so the router/start assets are bundled inline
  splitting: false,
});

if (!result.success) {
  console.error("Bundle failed:");
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

// Clean up the temp adapter source
rmSync(ADAPTER);

// Step 5: Inline any emitted WASM files as base64 data URLs.
// Node.js fetch() rejects relative/file: URLs, but data: URLs work fine.
const bundlePath = join(FUNC_DIR, "index.mjs");
const wasmFiles = readdirSync(FUNC_DIR).filter((f) => f.endsWith(".wasm"));
if (wasmFiles.length > 0) {
  let bundle = readFileSync(bundlePath, "utf-8");
  for (const wasmFile of wasmFiles) {
    const bytes = readFileSync(join(FUNC_DIR, wasmFile));
    const dataUrl = `data:application/wasm;base64,${bytes.toString("base64")}`;
    bundle = bundle.replaceAll(`"./${wasmFile}"`, JSON.stringify(dataUrl));
    rmSync(join(FUNC_DIR, wasmFile));
    console.log(`[wasm] Inlined ${wasmFile} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
  }
  writeFileSync(bundlePath, bundle);
}

// Step 6: Write Vercel output config
await Bun.write(
  `${OUTPUT}/config.json`,
  JSON.stringify({ version: 3, routes: [{ src: "/(.*)", dest: "/" }] }, null, 2)
);
await Bun.write(
  `${FUNC_DIR}/.vc-config.json`,
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      supportsResponseStreaming: true,
    },
    null,
    2
  )
);

console.log("Build complete → .vercel/output/");
