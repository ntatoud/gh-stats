import { Hono } from "hono";
import {
  devLangsController,
  devRankController,
} from "./controller";

export const devRoute = new Hono();

devRoute.get("/langs", devLangsController);
devRoute.get("/rank", devRankController);
