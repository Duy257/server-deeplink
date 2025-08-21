import admin from "firebase-admin";
import firebaseConfig from "../config/firebase.js";

export interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
}

export interface DataPayload {
  [key: string]: string;
}

export interface MessageOptions {
  notification?: NotificationPayload;
  data?: DataPayload;
  android?: admin.messaging.AndroidConfig;
  apns?: admin.messaging.ApnsConfig;
  webpush?: admin.messaging.WebpushConfig;
  fcmOptions?: admin.messaging.FcmOptions;
}

export interface MulticastMessageOptions extends MessageOptions {
  tokens: string[];
}

export interface TopicMessageOptions extends MessageOptions {
  topic: string;
}

export interface ConditionMessageOptions extends MessageOptions {
  condition: string;
}

// Custom error class for Firebase Messaging
export class FirebaseMessagingError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = "FirebaseMessagingError";
  }
}

export class FirebaseMessaging {
  private messaging: admin.messaging.Messaging;

  constructor() {
    this.messaging = firebaseConfig.getMessaging();
  }

  /**
   * Validate FCM token format
   */
  private validateToken(token: string): void {
    if (!token || typeof token !== "string") {
      throw new FirebaseMessagingError(
        "Invalid token: Token must be a non-empty string"
      );
    }
    if (token.length < 10) {
      throw new FirebaseMessagingError("Invalid token: Token is too short");
    }
  }

  /**
   * Validate topic format
   */
  private validateTopic(topic: string): void {
    if (!topic || typeof topic !== "string") {
      throw new FirebaseMessagingError(
        "Invalid topic: Topic must be a non-empty string"
      );
    }
    // Firebase topic regex pattern
    const topicPattern = /^[a-zA-Z0-9-_.~%]+$/;
    if (!topicPattern.test(topic)) {
      throw new FirebaseMessagingError(
        "Invalid topic: Topic must match pattern [a-zA-Z0-9-_.~%]+"
      );
    }
  }

  /**
   * Gửi tin nhắn đến một token cụ thể
   */
  async sendToToken(token: string, options: MessageOptions): Promise<string> {
    try {
      // Validate token
      this.validateToken(token);

      const message: admin.messaging.Message = {
        token,
        ...options,
      };

      const response = await this.messaging.send(message);
      console.log("Message sent successfully to token:", response);
      return response;
    } catch (error) {
      console.error("Error sending message to token:", error);
      if (error instanceof FirebaseMessagingError) {
        throw error;
      }
      throw new FirebaseMessagingError(
        "Failed to send message to token",
        (error as any)?.code,
        error
      );
    }
  }

  /**
   * Gửi tin nhắn đến nhiều token (multicast)
   */
  async sendToMultipleTokens(
    options: MulticastMessageOptions
  ): Promise<admin.messaging.BatchResponse> {
    try {
      const { tokens, ...messageOptions } = options;

      // Validate tokens
      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        throw new FirebaseMessagingError(
          "Invalid tokens: Must be a non-empty array"
        );
      }
      if (tokens.length > 500) {
        throw new FirebaseMessagingError(
          "Too many tokens: Maximum 500 tokens allowed per multicast message"
        );
      }
      tokens.forEach((token, index) => {
        try {
          this.validateToken(token);
        } catch (error) {
          throw new FirebaseMessagingError(
            `Invalid token at index ${index}: ${(error as Error).message}`
          );
        }
      });

      const message: admin.messaging.MulticastMessage = {
        tokens,
        ...messageOptions,
      };

      const response = await this.messaging.sendEachForMulticast(message);

      console.log(
        `Multicast message sent. Success: ${response.successCount}, Failure: ${response.failureCount}`
      );

      // Log failed tokens for debugging
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(
              `Failed to send to token ${tokens[idx]}:`,
              resp.error
            );
          }
        });
      }

      return response;
    } catch (error) {
      console.error("Error sending multicast message:", error);
      if (error instanceof FirebaseMessagingError) {
        throw error;
      }
      throw new FirebaseMessagingError(
        "Failed to send multicast message",
        (error as any)?.code,
        error
      );
    }
  }

  /**
   * Gửi tin nhắn đến một topic
   */
  async sendToTopic(options: TopicMessageOptions): Promise<string> {
    try {
      const { topic, ...messageOptions } = options;

      // Validate topic
      this.validateTopic(topic);

      const message: admin.messaging.Message = {
        topic,
        ...messageOptions,
      };

      const response = await this.messaging.send(message);
      console.log("Message sent successfully to topic:", response);
      return response;
    } catch (error) {
      console.error("Error sending message to topic:", error);
      if (error instanceof FirebaseMessagingError) {
        throw error;
      }
      throw new FirebaseMessagingError(
        "Failed to send message to topic",
        (error as any)?.code,
        error
      );
    }
  }

  /**
   * Validate condition string
   */
  private validateCondition(condition: string): void {
    if (!condition || typeof condition !== "string") {
      throw new FirebaseMessagingError(
        "Invalid condition: Condition must be a non-empty string"
      );
    }
    // Basic validation for condition syntax
    if (condition.length > 1000) {
      throw new FirebaseMessagingError(
        "Invalid condition: Condition string is too long (max 1000 chars)"
      );
    }
  }

  /**
   * Gửi tin nhắn theo điều kiện
   */
  async sendToCondition(options: ConditionMessageOptions): Promise<string> {
    try {
      const { condition, ...messageOptions } = options;

      // Validate condition
      this.validateCondition(condition);

      const message: admin.messaging.Message = {
        condition,
        ...messageOptions,
      };

      const response = await this.messaging.send(message);
      console.log("Message sent successfully to condition:", response);
      return response;
    } catch (error) {
      console.error("Error sending message to condition:", error);
      if (error instanceof FirebaseMessagingError) {
        throw error;
      }
      throw new FirebaseMessagingError(
        "Failed to send message to condition",
        (error as any)?.code,
        error
      );
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<any> {
    try {
      // Validate inputs
      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        throw new FirebaseMessagingError(
          "Invalid tokens: Must be a non-empty array"
        );
      }
      if (tokens.length > 1000) {
        throw new FirebaseMessagingError(
          "Too many tokens: Maximum 1000 tokens allowed per subscription request"
        );
      }
      tokens.forEach((token, index) => {
        try {
          this.validateToken(token);
        } catch (error) {
          throw new FirebaseMessagingError(
            `Invalid token at index ${index}: ${(error as Error).message}`
          );
        }
      });
      this.validateTopic(topic);

      const response = await this.messaging.subscribeToTopic(tokens, topic);
      console.log(
        `Successfully subscribed ${response.successCount} tokens to topic: ${topic}`
      );

      if (response.failureCount > 0) {
        console.error(
          `Failed to subscribe ${response.failureCount} tokens to topic: ${topic}`
        );
        response.errors.forEach((error, idx) => {
          console.error(`Token ${tokens[idx]} subscription failed:`, error);
        });
      }

      return response;
    } catch (error) {
      console.error("Error subscribing to topic:", error);
      if (error instanceof FirebaseMessagingError) {
        throw error;
      }
      throw new FirebaseMessagingError(
        "Failed to subscribe to topic",
        (error as any)?.code,
        error
      );
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<any> {
    try {
      // Validate inputs
      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        throw new FirebaseMessagingError(
          "Invalid tokens: Must be a non-empty array"
        );
      }
      if (tokens.length > 1000) {
        throw new FirebaseMessagingError(
          "Too many tokens: Maximum 1000 tokens allowed per unsubscription request"
        );
      }
      tokens.forEach((token, index) => {
        try {
          this.validateToken(token);
        } catch (error) {
          throw new FirebaseMessagingError(
            `Invalid token at index ${index}: ${(error as Error).message}`
          );
        }
      });
      this.validateTopic(topic);

      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      console.log(
        `Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`
      );

      if (response.failureCount > 0) {
        console.error(
          `Failed to unsubscribe ${response.failureCount} tokens from topic: ${topic}`
        );
        response.errors.forEach((error, idx) => {
          console.error(`Token ${tokens[idx]} unsubscription failed:`, error);
        });
      }

      return response;
    } catch (error) {
      console.error("Error unsubscribing from topic:", error);
      if (error instanceof FirebaseMessagingError) {
        throw error;
      }
      throw new FirebaseMessagingError(
        "Failed to unsubscribe from topic",
        (error as any)?.code,
        error
      );
    }
  }

  /**
   * Tạo notification payload đơn giản
   */
  createNotification(
    title: string,
    body: string,
    imageUrl?: string
  ): NotificationPayload {
    return {
      title,
      body,
      ...(imageUrl && { imageUrl }),
    };
  }

  /**
   * Tạo Android-specific config
   */
  createAndroidConfig(options: {
    priority?: "normal" | "high";
    ttl?: number;
    collapseKey?: string;
    restrictedPackageName?: string;
    notification?: admin.messaging.AndroidNotification;
  }): admin.messaging.AndroidConfig {
    return {
      priority: options.priority || "high",
      ...(options.ttl && { ttl: options.ttl }),
      ...(options.collapseKey && { collapseKey: options.collapseKey }),
      ...(options.restrictedPackageName && {
        restrictedPackageName: options.restrictedPackageName,
      }),
      ...(options.notification && { notification: options.notification }),
    };
  }

  /**
   * Tạo APNS (iOS) config
   */
  createApnsConfig(options: {
    headers?: { [key: string]: string };
    payload?: admin.messaging.ApnsPayload;
  }): admin.messaging.ApnsConfig {
    return {
      ...(options.headers && { headers: options.headers }),
      ...(options.payload && { payload: options.payload }),
    };
  }

  /**
   * Tạo Web Push config
   */
  createWebPushConfig(options: {
    headers?: { [key: string]: string };
    data?: { [key: string]: string };
    notification?: admin.messaging.WebpushNotification;
    fcmOptions?: admin.messaging.WebpushFcmOptions;
  }): admin.messaging.WebpushConfig {
    return {
      ...(options.headers && { headers: options.headers }),
      ...(options.data && { data: options.data }),
      ...(options.notification && { notification: options.notification }),
      ...(options.fcmOptions && { fcmOptions: options.fcmOptions }),
    };
  }
}
