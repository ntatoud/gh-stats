import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { usernameParam } from "@/shared/schemas.ts";
import { rankController } from "@/features/rank/controller.tsx";

export const rankRoute = new Hono();

rankRoute.get(
  "/rank/:username",
  zValidator("param", usernameParam),
  (c) => rankController(c, c.req.valid("param"))
);
