import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { usernameParam } from "@/shared/schemas.ts";
import { statsController } from "@/features/stats/controller.tsx";

export const statsRoute = new Hono();

statsRoute.get(
  "/stats/:username",
  zValidator("param", usernameParam),
  (c) => statsController(c, c.req.valid("param"))
);
