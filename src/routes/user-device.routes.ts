import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import userDeviceController from "../controllers/user-device.controller.js";
import {
  registerDeviceSchema,
  updateDeviceSchema,
  fcmTokenParamSchema,
  idParamSchema,
} from "../utils/validation.js";

const userDeviceRoutes = new Hono();

// Register or update a device
userDeviceRoutes.post(
  "/register",
  zValidator("json", registerDeviceSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Validation error",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userDeviceController.registerDevice(c)
);

// Get all devices for current user
userDeviceRoutes.get(
  "/",
  (c) => userDeviceController.getUserDevices(c)
);

// Get device by FCM token
userDeviceRoutes.get(
  "/token/:fcmToken",
  zValidator("param", fcmTokenParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid FCM token",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userDeviceController.getDeviceByToken(c)
);

// Update device by FCM token
userDeviceRoutes.put(
  "/token/:fcmToken",
  zValidator("param", fcmTokenParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid FCM token",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  zValidator("json", updateDeviceSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Validation error",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userDeviceController.updateDevice(c)
);

// Update last used timestamp
userDeviceRoutes.patch(
  "/token/:fcmToken/last-used",
  zValidator("param", fcmTokenParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid FCM token",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userDeviceController.updateLastUsed(c)
);

// Deactivate device
userDeviceRoutes.patch(
  "/token/:fcmToken/deactivate",
  zValidator("param", fcmTokenParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid FCM token",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userDeviceController.deactivateDevice(c)
);

// Remove device
userDeviceRoutes.delete(
  "/token/:fcmToken",
  zValidator("param", fcmTokenParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid FCM token",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userDeviceController.removeDevice(c)
);

// Get FCM tokens for a user (admin endpoint)
userDeviceRoutes.get(
  "/user/:id/tokens",
  zValidator("param", idParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid user ID",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userDeviceController.getUserFcmTokens(c)
);

// Cleanup inactive devices (admin endpoint)
userDeviceRoutes.delete(
  "/cleanup",
  (c) => userDeviceController.cleanupInactiveDevices(c)
);

// Get device statistics (admin endpoint)
userDeviceRoutes.get(
  "/stats",
  (c) => userDeviceController.getDeviceStats(c)
);

export default userDeviceRoutes;
