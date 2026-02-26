import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { writeFileSync, readFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { build as esbuild } from "esbuild";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

const ROOT = resolve(import.meta.dirname);
const NODE_MODULES = join(ROOT, "node_modules");

const TAKUMI_EXTERNALS = [
  "@takumi-rs/image-response",
  "@takumi-rs/core",
  "@takumi-rs/helpers",
];

// Platform-specific native binary packages from @takumi-rs/core optionalDependencies
const takumiCorePkg = JSON.parse(readFileSync(join(NODE_MODULES, "@takumi-rs/core/package.json"), "utf-8"));
const takumiPlatformPkgs: string[] = Object.keys(takumiCorePkg.optionalDependencies ?? {})
  .map((name) => name.replace("@takumi-rs/", ""));

// After TanStack Start builds dist/server/server.js, this plugin creates the
// Vercel Build Output API structure (.vercel/output/) with a Node.js function
// that adapts Vercel's IncomingMessage to the Web Request/Response API.
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
          external: TAKUMI_EXTERNALS,
          banner: { js: "import{createRequire}from'module';const require=createRequire(import.meta.url);" },
          logLevel: "info",
        });

        rmSync(ADAPTER);

        const FUNC_NM = join(FUNC_DIR, "node_modules/@takumi-rs");
        mkdirSync(FUNC_NM, { recursive: true });

        for (const pkg of ["image-response", "core", "helpers", ...takumiPlatformPkgs]) {
          const src = join(NODE_MODULES, "@takumi-rs", pkg);
          if (existsSync(src)) cpSync(src, join(FUNC_NM, pkg), { recursive: true });
        }

        writeFileSync(
          join(OUTPUT, "config.json"),
          JSON.stringify({ version: 3, routes: [{ src: "/(.*)", dest: "/" }] })
        );
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
    external: TAKUMI_EXTERNALS,
  },
});
