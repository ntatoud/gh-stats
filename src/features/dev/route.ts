import { Hono } from "hono";
import {
  devLangsController,
  devRankController,
} from "./controller.js";

export const devRoute = new Hono();

devRoute.get("/langs", devLangsController);
devRoute.get("/rank", devRankController);
