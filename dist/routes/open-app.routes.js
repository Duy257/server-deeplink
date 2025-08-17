import { Hono } from "hono";
import { openAppController } from "../controllers/open-app.controller.js";
const openAppRoutes = new Hono();
openAppRoutes.get("/open-app", openAppController);
export default openAppRoutes;
