import { Hono } from "hono";
import { statsRoute } from "@/routes/stats.tsx";
import { langsRoute } from "@/routes/langs.tsx";
import { devRoutes } from "@/routes/dev.tsx";
import { allowlist } from "@/middleware/allowlist.ts";
import { env } from "@/env.ts";

export const routes = new Hono();

routes.use("/stats/:username", allowlist);
routes.use("/langs/:username", allowlist);

routes.route("/", statsRoute);
routes.route("/", langsRoute);

if (env.NODE_ENV !== "production") {
  routes.route("/dev", devRoutes);
}
