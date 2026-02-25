import { handle } from "hono/vercel";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { routes } from "./routes.ts";

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

export default handle(app);
