import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { build } from "esbuild";

const ROOT = resolve(import.meta.dirname);
const OUTPUT = join(ROOT, ".vercel/output");
const FUNC_DIR = join(OUTPUT, "functions/index.func");
const NODE_MODULES = join(ROOT, "node_modules");

// Step 1: Vite build (generates dist/server/server.js + dist/client/)
execSync("pnpm exec vite build", { stdio: "inherit", cwd: ROOT });

// Step 2: Clean and prepare output directories
rmSync(OUTPUT, { recursive: true, force: true });
mkdirSync(FUNC_DIR, { recursive: true });

// Step 3: Write a thin Node.js adapter wrapping the TanStack Start fetch handler.
// Vercel's launcherType:"Nodejs" sends IncomingMessage/ServerResponse, not Web API Request.
const ADAPTER = join(FUNC_DIR, "_adapter.mjs");
writeFileSync(
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

// Step 4: Bundle with esbuild — keep @takumi-rs/* external (native Node.js addon)
await build({
  entryPoints: [ADAPTER],
  outfile: join(FUNC_DIR, "index.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  // @takumi-rs/image-response uses @takumi-rs/core (a native NAPI-RS addon).
  // Per Takumi docs for Nitro: externalize and trace the optional native binaries.
  // We copy the packages in step 5 so they're available at function runtime.
  external: ["@takumi-rs/image-response", "@takumi-rs/core", "@takumi-rs/helpers"],
  logLevel: "info",
  // CJS packages (e.g. react-dom/server.node) use require() at runtime.
  // Inject a createRequire shim so they work in ESM output.
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});

// Clean up temp adapter
rmSync(ADAPTER);

// Step 5: Copy @takumi-rs packages into the function's node_modules.
// @takumi-rs/core loads the platform-specific binary at runtime — which package
// is installed depends on the build platform (linux-x64-gnu on Vercel).
const FUNC_NM = join(FUNC_DIR, "node_modules/@takumi-rs");
mkdirSync(FUNC_NM, { recursive: true });

const pkgsToCopy = ["image-response", "core", "helpers"];
for (const pkg of pkgsToCopy) {
  const src = join(NODE_MODULES, "@takumi-rs", pkg);
  if (existsSync(src)) {
    cpSync(src, join(FUNC_NM, pkg), { recursive: true });
    console.log(`[copy] @takumi-rs/${pkg}`);
  }
}

// Copy whichever platform-specific core binary was installed (e.g. core-linux-x64-gnu on Vercel)
for (const entry of readdirSync(join(NODE_MODULES, "@takumi-rs"))) {
  if (entry.startsWith("core-")) {
    cpSync(join(NODE_MODULES, "@takumi-rs", entry), join(FUNC_NM, entry), { recursive: true });
    console.log(`[copy] @takumi-rs/${entry}`);
  }
}

// Step 6: Write Vercel output config
writeFileSync(
  join(OUTPUT, "config.json"),
  JSON.stringify({ version: 3, routes: [{ src: "/(.*)", dest: "/" }] }, null, 2)
);
writeFileSync(
  join(FUNC_DIR, ".vc-config.json"),
  JSON.stringify(
    { runtime: "nodejs22.x", handler: "index.mjs", launcherType: "Nodejs", supportsResponseStreaming: true },
    null,
    2
  )
);

console.log("Build complete → .vercel/output/");
