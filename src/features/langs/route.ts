import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { usernameParam } from "../../shared/schemas.js";
import { langsController } from "./controller.js";

export const langsRoute = new Hono();

langsRoute.get(
  "/langs/:username",
  zValidator("param", usernameParam),
  (c) => langsController(c, c.req.valid("param"))
);
