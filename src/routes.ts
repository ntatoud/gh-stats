import { Hono } from "hono";
import { statsRoute } from "@/features/stats/route.ts";
import { langsRoute } from "@/features/langs/route.ts";
import { devRoute } from "@/features/dev/route.ts";
import { allowlist } from "@/middleware/allowlist.ts";
import { env } from "@/env.ts";

export const routes = new Hono();

routes.use("/stats/:username", allowlist);
routes.use("/langs/:username", allowlist);

routes.route("/", statsRoute);
routes.route("/", langsRoute);

if (env.NODE_ENV !== "production") {
  routes.route("/dev", devRoute);
}
