import { Context } from "hono";
import { FirebaseMessaging } from "../plugins/firebase-messaging.js";
import firebaseConfig from "../config/firebase.js";
import UserDeviceModel from "../models/user-device.model.js";
import { DevicePlatform } from "../types/user-device.js";

export class NotificationController {
  private messaging: FirebaseMessaging;
  private userDeviceModel: UserDeviceModel;
  private initialized = false;

  constructor() {
    this.messaging = new FirebaseMessaging();
    this.userDeviceModel = new UserDeviceModel();
  }

  /**
   * Khởi tạo Firebase (gọi một lần khi start server)
   */
  async initialize() {
    if (!this.initialized) {
      await firebaseConfig.initialize();
      this.initialized = true;
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Gửi notification đến một user (tất cả devices của user)
   * POST /api/v1/notifications/send-to-user
   */
  async sendToUser(c: Context) {
    try {
      await this.ensureInitialized();

      const body = await c.req.json();
      const { userId, title, body: messageBody, imageUrl, data } = body;

      if (!userId || !title || !messageBody) {
        return c.json(
          {
            success: false,
            message: "userId, title, and body are required",
          },
          400
        );
      }

      // Get all FCM tokens for the user
      const fcmTokens = await this.userDeviceModel.getUserFcmTokens(userId);

      if (fcmTokens.length === 0) {
        return c.json(
          {
            success: false,
            message: "No active devices found for user",
          },
          404
        );
      }

      const notification = this.messaging.createNotification(
        title,
        messageBody,
        imageUrl
      );

      // Send to multiple tokens
      const response = await this.messaging.sendToMultipleTokens({
        tokens: fcmTokens,
        notification,
        data: data || {},
      });

      // Update last used for successful tokens and handle failed ones
      await this.handleTokenResponses(response, fcmTokens);

      return c.json({
        success: true,
        message: "Notification sent to user successfully",
        data: {
          successCount: response.successCount,
          failureCount: response.failureCount,
          totalTokens: fcmTokens.length,
        },
      });
    } catch (error) {
      console.error("Error sending notification to user:", error);
      return c.json(
        {
          success: false,
          message: "Failed to send notification to user",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }

  /**
   * Helper method to handle token responses
   */
  private async handleTokenResponses(response: any, tokens: string[]) {
    // Update last used for successful tokens
    const successfulTokens = response.responses
      .map((resp: any, idx: number) => (resp.success ? tokens[idx] : null))
      .filter((token: string | null) => token !== null);

    await Promise.all(
      successfulTokens.map((token: string) =>
        this.userDeviceModel.updateLastUsed(token)
      )
    );

    // Handle failed tokens (deactivate invalid ones)
    const failedTokens = response.responses
      .map((resp: any, idx: number) =>
        !resp.success ? { token: tokens[idx], error: resp.error } : null
      )
      .filter((item: any) => item !== null);

    for (const failed of failedTokens) {
      if (
        failed?.error?.code === "messaging/invalid-registration-token" ||
        failed?.error?.code === "messaging/registration-token-not-registered"
      ) {
        await this.userDeviceModel.deactivateDevice(failed.token);
      }
    }
  }

  /**
   * Gửi notification đến một token
   * POST /api/v1/notifications/send-to-token
   */
  async sendToToken(c: Context) {
    try {
      await this.ensureInitialized();

      const body = await c.req.json();
      const { token, title, body: messageBody, imageUrl, data } = body;

      if (!token || !title || !messageBody) {
        return c.json(
          {
            success: false,
            message: "Token, title, and body are required",
          },
          400
        );
      }

      const notification = this.messaging.createNotification(
        title,
        messageBody,
        imageUrl
      );

      const response = await this.messaging.sendToToken(token, {
        notification,
        data: data || {},
      });

      // Update last used timestamp
      await this.userDeviceModel.updateLastUsed(token);

      return c.json({
        success: true,
        message: "Notification sent successfully",
        messageId: response,
      });
    } catch (error: any) {
      console.error("Error sending notification to token:", error);

      // Handle invalid token
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        const body = await c.req.json();
        await this.userDeviceModel.deactivateDevice(body.token);
      }

      return c.json(
        {
          success: false,
          message: "Failed to send notification",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }

  /**
   * Gửi notification đến nhiều token
   * POST /api/v1/notifications/send-to-multiple
   */
  async sendToMultiple(c: Context) {
    try {
      const body = await c.req.json();
      const { tokens, title, body: messageBody, imageUrl, data } = body;

      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return c.json(
          {
            success: false,
            message: "Tokens array is required and must not be empty",
          },
          400
        );
      }

      if (!title || !messageBody) {
        return c.json(
          {
            success: false,
            message: "Title and body are required",
          },
          400
        );
      }

      const notification = this.messaging.createNotification(
        title,
        messageBody,
        imageUrl
      );

      const response = await this.messaging.sendToMultipleTokens({
        tokens,
        notification,
        data: data || {},
      });

      return c.json({
        success: true,
        message: "Multicast notification sent",
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      });
    } catch (error) {
      console.error("Error sending multicast notification:", error);
      return c.json(
        {
          success: false,
          message: "Failed to send multicast notification",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }

  /**
   * Gửi notification đến topic
   * POST /api/v1/notifications/send-to-topic
   */
  async sendToTopic(c: Context) {
    try {
      const body = await c.req.json();
      const { topic, title, body: messageBody, imageUrl, data } = body;

      if (!topic || !title || !messageBody) {
        return c.json(
          {
            success: false,
            message: "Topic, title, and body are required",
          },
          400
        );
      }

      const notification = this.messaging.createNotification(
        title,
        messageBody,
        imageUrl
      );

      const response = await this.messaging.sendToTopic({
        topic,
        notification,
        data: data || {},
      });

      return c.json({
        success: true,
        message: "Topic notification sent successfully",
        messageId: response,
      });
    } catch (error) {
      console.error("Error sending topic notification:", error);
      return c.json(
        {
          success: false,
          message: "Failed to send topic notification",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }

  /**
   * Subscribe tokens to topic
   * POST /api/v1/notifications/subscribe-to-topic
   */
  async subscribeToTopic(c: Context) {
    try {
      const body = await c.req.json();
      const { tokens, topic } = body;

      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return c.json(
          {
            success: false,
            message: "Tokens array is required and must not be empty",
          },
          400
        );
      }

      if (!topic) {
        return c.json(
          {
            success: false,
            message: "Topic is required",
          },
          400
        );
      }

      const response = await this.messaging.subscribeToTopic(tokens, topic);

      return c.json({
        success: true,
        message: "Tokens subscribed to topic",
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    } catch (error) {
      console.error("Error subscribing to topic:", error);
      return c.json(
        {
          success: false,
          message: "Failed to subscribe to topic",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }

  /**
   * Unsubscribe tokens from topic
   * POST /api/v1/notifications/unsubscribe-from-topic
   */
  async unsubscribeFromTopic(c: Context) {
    try {
      const body = await c.req.json();
      const { tokens, topic } = body;

      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return c.json(
          {
            success: false,
            message: "Tokens array is required and must not be empty",
          },
          400
        );
      }

      if (!topic) {
        return c.json(
          {
            success: false,
            message: "Topic is required",
          },
          400
        );
      }

      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);

      return c.json({
        success: true,
        message: "Tokens unsubscribed from topic",
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    } catch (error) {
      console.error("Error unsubscribing from topic:", error);
      return c.json(
        {
          success: false,
          message: "Failed to unsubscribe from topic",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }
}

export const notificationController = new NotificationController();
