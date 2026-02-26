import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { build as esbuild } from "esbuild";
import type { Plugin } from "vite";

const ROOT = resolve(import.meta.dirname);
const NODE_MODULES = join(ROOT, "node_modules");

// After TanStack Start's SSR build produces dist/server/server.js, this plugin:
//  1. Wraps it with a Node.js IncomingMessage→Request adapter (Vercel launcherType:"Nodejs")
//  2. Bundles everything with esbuild, keeping @takumi-rs/* external
//  3. Copies the @takumi-rs native addon packages alongside the bundle
//  4. Writes Vercel Build Output API config files
function vercelPlugin(): Plugin {
  return {
    name: "vercel-output",
    apply: "build",
    buildApp: {
      order: "post",
      async handler() {
        const OUTPUT = join(ROOT, ".vercel/output");
        const FUNC_DIR = join(OUTPUT, "functions/index.func");

        rmSync(OUTPUT, { recursive: true, force: true });
        mkdirSync(FUNC_DIR, { recursive: true });

        // Thin adapter: converts Vercel's IncomingMessage to Web API Request/Response
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
  const request = new Request(url, { method, headers, body: hasBody ? req : null, duplex: "half" });
  const response = await server.fetch(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
`
        );

        await esbuild({
          entryPoints: [ADAPTER],
          outfile: join(FUNC_DIR, "index.mjs"),
          bundle: true,
          platform: "node",
          format: "esm",
          // Keep @takumi-rs/* external — native NAPI-RS addon, resolved from copied node_modules
          external: ["@takumi-rs/image-response", "@takumi-rs/core", "@takumi-rs/helpers"],
          // CJS packages (react-dom/server.node) need require() — provide it via createRequire
          banner: { js: "import{createRequire}from'module';const require=createRequire(import.meta.url);" },
          logLevel: "info",
        });

        rmSync(ADAPTER);

        // Copy @takumi-rs packages into the function's node_modules so native bindings resolve.
        // The platform binary that was installed (linux-x64-gnu on Vercel) is automatically picked up.
        const FUNC_NM = join(FUNC_DIR, "node_modules/@takumi-rs");
        mkdirSync(FUNC_NM, { recursive: true });

        for (const pkg of ["image-response", "core", "helpers"]) {
          const src = join(NODE_MODULES, "@takumi-rs", pkg);
          if (existsSync(src)) cpSync(src, join(FUNC_NM, pkg), { recursive: true });
        }
        for (const entry of readdirSync(join(NODE_MODULES, "@takumi-rs"))) {
          if (entry.startsWith("core-")) cpSync(join(NODE_MODULES, "@takumi-rs", entry), join(FUNC_NM, entry), { recursive: true });
        }

        writeFileSync(join(OUTPUT, "config.json"), JSON.stringify({ version: 3, routes: [{ src: "/(.*)", dest: "/" }] }));
        writeFileSync(
          join(FUNC_DIR, ".vc-config.json"),
          JSON.stringify({ runtime: "nodejs22.x", handler: "index.mjs", launcherType: "Nodejs", supportsResponseStreaming: true })
        );

        console.log("✓ .vercel/output/ ready");
      },
    },
  };
}

export default defineConfig({
  plugins: [tanstackStart({ srcDirectory: "app" }), viteReact(), vercelPlugin()],
  resolve: {
    alias: { "@": new URL("./src", import.meta.url).pathname },
  },
  ssr: {
    // Keep @takumi-rs/* external in the SSR bundle — native NAPI-RS addon
    external: ["@takumi-rs/image-response", "@takumi-rs/core", "@takumi-rs/helpers"],
  },
});
