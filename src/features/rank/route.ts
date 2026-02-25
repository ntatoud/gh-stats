import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { usernameParam } from "../../shared/schemas.js";
import { rankController } from "./controller.js";

export const rankRoute = new Hono();

rankRoute.get(
  "/rank/:username",
  zValidator("param", usernameParam),
  (c) => rankController(c, c.req.valid("param"))
);
