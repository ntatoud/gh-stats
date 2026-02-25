import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { routes } from "./routes.ts";
import type { IncomingMessage, ServerResponse } from "node:http";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) =>
  c.json({
    name: "gh-stats",
    description: "GitHub stats as styled images for your profile",
    endpoints: {
      stats: "/stats/:username",
      langs: "/langs/:username",
    },
    example: {
      stats: "/stats/torvalds",
      langs: "/langs/torvalds",
    },
  })
);

app.route("/", routes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `https://${host}`);
  const headers = new Headers(req.headers as Record<string, string>);
  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";

  const request = new Request(url, {
    method,
    headers,
    body: hasBody ? (req as unknown as ReadableStream) : null,
    // @ts-ignore - duplex required for streaming request bodies in Node.js
    duplex: "half",
  });

  const response = await app.fetch(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));

  const buffer = await response.arrayBuffer();
  res.end(Buffer.from(buffer));
}
