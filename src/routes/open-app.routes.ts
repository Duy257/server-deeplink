import { Hono } from "hono";
import { openAppController } from "../controllers/open-app.controller.js";
import userRoutes from "./user.routes.js";
import userDeviceRoutes from "./user-device.routes.js";
import notificationRoutes from "./notification.routes.js";

const openAppRoutes = new Hono();

// Legacy route
openAppRoutes.get("/open-app", openAppController);

// API v1 routes
openAppRoutes.route("/v1/users", userRoutes);
openAppRoutes.route("/v1/devices", userDeviceRoutes);
openAppRoutes.route("/v1/notifications", notificationRoutes);

export default openAppRoutes;
