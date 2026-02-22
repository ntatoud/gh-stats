import { Hono } from "hono";
import {
  devLangsController,
  devRankController,
} from "@/features/dev/controller.tsx";

export const devRoute = new Hono();

devRoute.get("/langs", devLangsController);
devRoute.get("/rank", devRankController);
