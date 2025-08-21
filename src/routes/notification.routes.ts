import { Hono } from "hono";
import { notificationController } from "../controllers/notification.controller.js";

const notificationRoutes = new Hono();

/**
 * @route POST /notifications/send-to-user
 * @desc Gửi notification đến tất cả devices của một user
 * @body {
 *   userId: string,
 *   title: string,
 *   body: string,
 *   imageUrl?: string,
 *   data?: object
 * }
 */
notificationRoutes.post("/send-to-user", async (c) => {
  return await notificationController.sendToUser(c);
});

/**
 * @route POST /notifications/send-to-token
 * @desc Gửi notification đến một FCM token
 * @body {
 *   token: string,
 *   title: string,
 *   body: string,
 *   imageUrl?: string,
 *   data?: object
 * }
 */
notificationRoutes.post("/send-to-token", async (c) => {
  return await notificationController.sendToToken(c);
});

/**
 * @route POST /notifications/send-to-multiple
 * @desc Gửi notification đến nhiều FCM tokens
 * @body {
 *   tokens: string[],
 *   title: string,
 *   body: string,
 *   imageUrl?: string,
 *   data?: object
 * }
 */
notificationRoutes.post("/send-to-multiple", async (c) => {
  return await notificationController.sendToMultiple(c);
});

/**
 * @route POST /notifications/send-to-topic
 * @desc Gửi notification đến một topic
 * @body {
 *   topic: string,
 *   title: string,
 *   body: string,
 *   imageUrl?: string,
 *   data?: object
 * }
 */
notificationRoutes.post("/send-to-topic", async (c) => {
  return await notificationController.sendToTopic(c);
});

/**
 * @route POST /notifications/subscribe-to-topic
 * @desc Subscribe FCM tokens to a topic
 * @body {
 *   tokens: string[],
 *   topic: string
 * }
 */
notificationRoutes.post("/subscribe-to-topic", async (c) => {
  return await notificationController.subscribeToTopic(c);
});

/**
 * @route POST /notifications/unsubscribe-from-topic
 * @desc Unsubscribe FCM tokens from a topic
 * @body {
 *   tokens: string[],
 *   topic: string
 * }
 */
notificationRoutes.post("/unsubscribe-from-topic", async (c) => {
  return await notificationController.unsubscribeFromTopic(c);
});

/**
 * @route GET /notifications/health
 * @desc Health check cho notification service
 */
notificationRoutes.get("/health", (c) => {
  return c.json({
    success: true,
    message: "Notification service is running",
    timestamp: new Date().toISOString(),
  });
});

export default notificationRoutes;
