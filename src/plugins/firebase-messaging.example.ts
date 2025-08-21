import { FirebaseMessaging } from './firebase-messaging.js';
import firebaseConfig from '../config/firebase.js';

/**
 * Ví dụ sử dụng FirebaseMessaging class
 */
export class FirebaseMessagingExample {
  private messaging: FirebaseMessaging;

  constructor() {
    this.messaging = new FirebaseMessaging();
  }

  /**
   * Khởi tạo Firebase trước khi sử dụng
   */
  async initialize() {
    await firebaseConfig.initialize();
  }

  /**
   * Ví dụ gửi notification đơn giản đến một token
   */
  async sendSimpleNotification(token: string) {
    try {
      const notification = this.messaging.createNotification(
        'Chào mừng!',
        'Bạn có một thông báo mới từ ứng dụng',
        'https://example.com/image.png'
      );

      const response = await this.messaging.sendToToken(token, {
        notification,
        data: {
          type: 'welcome',
          timestamp: Date.now().toString(),
        },
      });

      console.log('Notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending simple notification:', error);
      throw error;
    }
  }

  /**
   * Ví dụ gửi notification với Android config
   */
  async sendAndroidNotification(token: string) {
    try {
      const notification = this.messaging.createNotification(
        'Thông báo quan trọng',
        'Đây là thông báo có độ ưu tiên cao cho Android'
      );

      const androidConfig = this.messaging.createAndroidConfig({
        priority: 'high',
        ttl: 3600000, // 1 hour
        notification: {
          icon: 'stock_ticker_update',
          color: '#f45342',
          sound: 'default',
          tag: 'important',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      });

      const response = await this.messaging.sendToToken(token, {
        notification,
        android: androidConfig,
        data: {
          type: 'important',
          action: 'open_app',
        },
      });

      console.log('Android notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending Android notification:', error);
      throw error;
    }
  }

  /**
   * Ví dụ gửi notification với iOS config
   */
  async sendIOSNotification(token: string) {
    try {
      const notification = this.messaging.createNotification(
        'iOS Notification',
        'Thông báo đặc biệt cho iOS'
      );

      const apnsConfig = this.messaging.createApnsConfig({
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
        payload: {
          aps: {
            alert: {
              title: 'iOS Notification',
              body: 'Thông báo đặc biệt cho iOS',
            },
            badge: 1,
            sound: 'default',
            category: 'MESSAGE_CATEGORY',
          },
        },
      });

      const response = await this.messaging.sendToToken(token, {
        notification,
        apns: apnsConfig,
        data: {
          type: 'ios_special',
          category: 'message',
        },
      });

      console.log('iOS notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending iOS notification:', error);
      throw error;
    }
  }

  /**
   * Ví dụ gửi notification đến nhiều token
   */
  async sendMulticastNotification(tokens: string[]) {
    try {
      const notification = this.messaging.createNotification(
        'Thông báo hàng loạt',
        'Tin nhắn này được gửi đến nhiều thiết bị cùng lúc'
      );

      const response = await this.messaging.sendToMultipleTokens({
        tokens,
        notification,
        data: {
          type: 'multicast',
          batch_id: `batch_${Date.now()}`,
        },
      });

      console.log('Multicast notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw error;
    }
  }

  /**
   * Ví dụ gửi notification đến topic
   */
  async sendTopicNotification(topic: string) {
    try {
      const notification = this.messaging.createNotification(
        'Thông báo chủ đề',
        `Tin mới từ chủ đề: ${topic}`
      );

      const response = await this.messaging.sendToTopic({
        topic,
        notification,
        data: {
          type: 'topic_message',
          topic_name: topic,
        },
      });

      console.log('Topic notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw error;
    }
  }

  /**
   * Ví dụ gửi notification theo điều kiện
   */
  async sendConditionalNotification() {
    try {
      const condition = "'news' in topics && ('sports' in topics || 'weather' in topics)";
      
      const notification = this.messaging.createNotification(
        'Thông báo có điều kiện',
        'Tin nhắn này chỉ gửi đến người dùng quan tâm tin tức và (thể thao hoặc thời tiết)'
      );

      const response = await this.messaging.sendToCondition({
        condition,
        notification,
        data: {
          type: 'conditional',
          condition_used: condition,
        },
      });

      console.log('Conditional notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending conditional notification:', error);
      throw error;
    }
  }

  /**
   * Ví dụ quản lý topic subscription
   */
  async manageTopicSubscriptions(tokens: string[], topic: string) {
    try {
      // Subscribe to topic
      const subscribeResponse = await this.messaging.subscribeToTopic(tokens, topic);
      console.log('Subscribe response:', subscribeResponse);

      // Wait a bit before unsubscribing (for demo purposes)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Unsubscribe from topic
      const unsubscribeResponse = await this.messaging.unsubscribeFromTopic(tokens, topic);
      console.log('Unsubscribe response:', unsubscribeResponse);

      return { subscribeResponse, unsubscribeResponse };
    } catch (error) {
      console.error('Error managing topic subscriptions:', error);
      throw error;
    }
  }

  /**
   * Ví dụ gửi data-only message (không có notification)
   */
  async sendDataOnlyMessage(token: string) {
    try {
      const response = await this.messaging.sendToToken(token, {
        data: {
          type: 'data_only',
          action: 'sync_data',
          payload: JSON.stringify({
            user_id: '12345',
            sync_timestamp: Date.now(),
          }),
        },
      });

      console.log('Data-only message sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending data-only message:', error);
      throw error;
    }
  }
}

// Export instance để sử dụng
export const messagingExample = new FirebaseMessagingExample();
