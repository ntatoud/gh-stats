import { Hono } from "hono";
import { devStatsController, devLangsController } from "@/features/dev/controller.tsx";

export const devRoute = new Hono();

devRoute.get("/stats", devStatsController);
devRoute.get("/langs", devLangsController);
