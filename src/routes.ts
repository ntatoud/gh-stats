import { Hono } from "hono";
import { langsRoute } from "./features/langs/route.js";
import { rankRoute } from "./features/rank/route.js";
import { devRoute } from "./features/dev/route.js";
import { allowlist } from "./middleware/allowlist.js";
import { env } from "./env.js";

export const routes = new Hono();

routes.use("/langs/:username", allowlist);
routes.use("/rank/:username", allowlist);

routes.route("/", langsRoute);
routes.route("/", rankRoute);

if (env.NODE_ENV !== "production") {
  routes.route("/dev", devRoute);
}
