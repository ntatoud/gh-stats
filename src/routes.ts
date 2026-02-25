import { Hono } from "hono";
import { langsRoute } from "@/features/langs/route.ts";
import { rankRoute } from "@/features/rank/route.ts";
import { devRoute } from "@/features/dev/route.ts";
import { allowlist } from "@/middleware/allowlist.ts";
import { env } from "@/env.ts";

export const routes = new Hono();

routes.use("/langs/:username", allowlist);
routes.use("/rank/:username", allowlist);

routes.route("/", langsRoute);
routes.route("/", rankRoute);

if (env.NODE_ENV !== "production") {
  routes.route("/dev", devRoute);
}
