# Firebase Messaging Plugin - Hướng Dẫn Chi Tiết

## 📋 Mục Lục

1. [Tổng quan](#tổng-quan)
2. [Cài đặt và Cấu hình](#cài-đặt-và-cấu-hình)
3. [Khởi tạo và Sử dụng](#khởi-tạo-và-sử-dụng)
4. [API Reference](#api-reference)
5. [Ví dụ thực tế](#ví-dụ-thực-tế)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## 🔥 Tổng quan

Plugin Firebase Messaging cung cấp một interface hoàn chỉnh và type-safe để sử dụng Firebase Cloud Messaging (FCM) trong ứng dụng Hono với MongoDB backend. Plugin này hỗ trợ gửi push notifications đến:

- **Mobile Apps**: iOS và Android
- **Web Applications**: Progressive Web Apps (PWA)
- **Multiple Platforms**: Cùng lúc với platform-specific configurations

### ✨ Các tính năng đã được chuẩn hóa

#### 1. **Validation đầu vào**

- ✅ Kiểm tra format của FCM token
- ✅ Validate topic name theo pattern của Firebase
- ✅ Validate condition string
- ✅ Kiểm tra giới hạn số lượng tokens (500 cho multicast, 1000 cho topic subscription)

#### 2. **Error Handling**

- ✅ Custom error class `FirebaseMessagingError` với error code và details
- ✅ Proper error propagation và logging
- ✅ Detailed error messages cho debugging

#### 3. **Type Safety**

- ✅ Interfaces cho tất cả message options
- ✅ Strong typing cho Firebase Admin SDK
- ✅ Proper TypeScript configuration

#### 4. **Module System**

- ✅ ES Module imports tương thích với `"type": "module"`
- ✅ Proper file extensions trong imports (`.js`)

## 🛠️ Cài đặt và Cấu hình

### Bước 1: Cài đặt Dependencies

Firebase Admin SDK đã được cài đặt trong dự án:

```bash
npm install firebase-admin
```

### Bước 2: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **Project Settings** > **Service accounts**
4. Click **Generate new private key** và tải về file JSON
5. Lưu file JSON vào thư mục an toàn (không commit vào git)

### Bước 3: Cấu hình Environment Variables

Có 2 cách để cấu hình Firebase credentials:

#### Option 1: Sử dụng Service Account Key File (Khuyến nghị cho Development)

```env
# Required
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
```

#### Option 2: Sử dụng Environment Variables (Khuyến nghị cho Production)

```env
# Required
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### Bước 4: Cấu trúc File trong Dự án

```
src/
├── config/
│   └── firebase.js              # Firebase configuration
├── plugins/
│   ├── firebase-messaging.ts    # Main FirebaseMessaging class
│   ├── firebase-messaging.example.ts  # Usage examples
│   ├── firebase-messaging.test.ts     # Test configuration
│   ├── firebase-messaging.README.md   # This documentation
│   └── index.ts                 # Plugin exports
```

## 🚀 Khởi tạo và Sử dụng

### Import và Khởi tạo

```typescript
import { FirebaseMessaging, firebaseConfig } from "./plugins/index.js";

// Khởi tạo Firebase trước khi sử dụng
await firebaseConfig.initialize();

// Tạo instance messaging
const messaging = new FirebaseMessaging();
```

### Kiểm tra Cấu hình

Trước khi sử dụng, bạn có thể chạy test để kiểm tra cấu hình:

```bash
# Chạy test cấu hình Firebase
npm run test:firebase

# Hoặc chạy trực tiếp file test
node src/plugins/firebase-messaging.test.js
```

### Các Phương thức Cơ bản

#### 1. Gửi thông báo đến một thiết bị

```typescript
// Tạo notification payload
const notification = messaging.createNotification(
  "Tiêu đề thông báo",
  "Nội dung thông báo",
  "https://example.com/image.png" // optional
);

try {
  const response = await messaging.sendToToken("fcm-token-của-thiết-bị", {
    notification,
    data: {
      type: "welcome",
      timestamp: Date.now().toString(),
    },
  });
  console.log("Message sent:", response);
} catch (error) {
  if (error instanceof FirebaseMessagingError) {
    console.error("Messaging error:", error.message, error.code);
  }
}
```

#### 2. Gửi thông báo đến nhiều thiết bị (Multicast)

```typescript
const response = await messaging.sendToMultipleTokens({
  tokens: ["token1", "token2", "token3"], // Tối đa 500 tokens
  notification: {
    title: "Thông báo broadcast",
    body: "Gửi đến nhiều thiết bị",
  },
  data: {
    type: "broadcast",
    category: "news",
  },
});

console.log(
  `Success: ${response.successCount}, Failed: ${response.failureCount}`
);

// Xử lý các token thất bại
if (response.failureCount > 0) {
  response.responses.forEach((resp, idx) => {
    if (!resp.success) {
      console.error(`Token ${tokens[idx]} failed:`, resp.error);
    }
  });
}
```

#### 3. Gửi thông báo đến topic

```typescript
// Bước 1: Subscribe tokens vào topic
await messaging.subscribeToTopic(
  ["token1", "token2"], // Tối đa 1000 tokens
  "news-updates"
);

// Bước 2: Gửi message đến topic
await messaging.sendToTopic({
  topic: "news-updates",
  notification: {
    title: "Breaking News",
    body: "New update available",
  },
  data: {
    article_id: "12345",
    category: "breaking",
  },
});
```

#### 4. Gửi thông báo theo điều kiện

```typescript
// Gửi đến users subscribe cả 'news' và 'sports' topics
await messaging.sendToCondition({
  condition: "'news' in topics && 'sports' in topics",
  notification: {
    title: "Sports News",
    body: "Latest sports update",
  },
});

// Điều kiện phức tạp hơn
await messaging.sendToCondition({
  condition:
    "'news' in topics && ('sports' in topics || 'entertainment' in topics)",
  notification: {
    title: "Mixed Content",
    body: "News and entertainment update",
  },
});
```

### Platform-Specific Configurations

#### Android Configuration

```typescript
const androidConfig = messaging.createAndroidConfig({
  priority: "high",
  ttl: 3600000, // 1 hour
  restrictedPackageName: "com.example.app",
  data: {
    click_action: "FLUTTER_NOTIFICATION_CLICK",
  },
  notification: {
    icon: "notification_icon",
    color: "#FF0000",
    sound: "default",
    tag: "important",
    clickAction: "OPEN_ACTIVITY",
    bodyLocKey: "body_loc_key",
    bodyLocArgs: ["arg1", "arg2"],
    titleLocKey: "title_loc_key",
    titleLocArgs: ["title_arg1"],
  },
});

await messaging.sendToToken(token, {
  notification,
  android: androidConfig,
});
```

#### iOS/macOS Configuration (APNS)

```typescript
const apnsConfig = messaging.createApnsConfig({
  headers: {
    "apns-priority": "10",
    "apns-push-type": "alert",
    "apns-collapse-id": "collapse-id",
  },
  payload: {
    aps: {
      alert: {
        title: "iOS Title",
        body: "iOS Body",
        titleLocKey: "TITLE_LOC_KEY",
        titleLocArgs: ["arg1"],
        actionLocKey: "ACTION_LOC_KEY",
        locKey: "LOC_KEY",
        locArgs: ["arg1", "arg2"],
        launchImage: "launch_image.png",
      },
      badge: 1,
      sound: "default",
      contentAvailable: true,
      mutableContent: true,
      category: "MESSAGE_CATEGORY",
      threadId: "thread-id",
    },
    customData: {
      key1: "value1",
      key2: "value2",
    },
  },
});

await messaging.sendToToken(token, {
  notification,
  apns: apnsConfig,
});
```

#### Web Push Configuration

```typescript
const webpushConfig = messaging.createWebPushConfig({
  headers: {
    TTL: "300",
    Urgency: "high",
  },
  data: {
    click_action: "https://example.com/action",
  },
  notification: {
    title: "Web Notification",
    body: "Nội dung cho web",
    icon: "/icon-192x192.png",
    image: "/banner-image.png",
    badge: "/badge-72x72.png",
    tag: "web-notification",
    requireInteraction: true,
    silent: false,
    timestamp: Date.now(),
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/view-icon.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  },
  fcmOptions: {
    link: "https://example.com/landing",
  },
});

await messaging.sendToToken(token, {
  notification,
  webpush: webpushConfig,
});
```

#### Multi-Platform Message

```typescript
// Gửi message với config cho tất cả platforms
await messaging.sendToToken(token, {
  notification: {
    title: "Multi-platform Notification",
    body: "This works on all platforms",
  },
  data: {
    type: "multi_platform",
    timestamp: Date.now().toString(),
  },
  android: androidConfig,
  apns: apnsConfig,
  webpush: webpushConfig,
});
```

## 📚 API Reference

### Core Methods

#### `sendToToken(token: string, options: MessageOptions): Promise<string>`

Gửi message đến một FCM token cụ thể.

**Parameters:**

- `token`: FCM registration token
- `options`: Message configuration object
  - `notification?`: Notification payload
  - `data?`: Data payload (key-value pairs)
  - `android?`: Android-specific configuration
  - `apns?`: iOS/macOS-specific configuration
  - `webpush?`: Web Push-specific configuration

**Returns:** Message ID string

**Example:**

```typescript
const messageId = await messaging.sendToToken("token123", {
  notification: { title: "Hello", body: "World" },
  data: { key: "value" },
});
```

#### `sendToMultipleTokens(options: MulticastMessageOptions): Promise<BatchResponse>`

Gửi message đến nhiều tokens (tối đa 500).

**Parameters:**

- `options.tokens`: Array of FCM tokens (max 500)
- `options.notification?`: Notification payload
- `options.data?`: Data payload
- `options.android/apns/webpush?`: Platform configs

**Returns:** BatchResponse with success/failure counts and detailed responses

**Example:**

```typescript
const response = await messaging.sendToMultipleTokens({
  tokens: ["token1", "token2", "token3"],
  notification: { title: "Broadcast", body: "Message" },
});
console.log(
  `Success: ${response.successCount}, Failed: ${response.failureCount}`
);
```

#### `sendToTopic(options: TopicMessageOptions): Promise<string>`

Gửi message đến một topic.

**Parameters:**

- `options.topic`: Topic name (must match Firebase pattern)
- `options.notification?`: Notification payload
- `options.data?`: Data payload

**Returns:** Message ID string

#### `sendToCondition(options: ConditionMessageOptions): Promise<string>`

Gửi message với điều kiện (e.g., `'TopicA' in topics && 'TopicB' in topics`).

**Parameters:**

- `options.condition`: Boolean condition string (max 1000 chars)
- `options.notification?`: Notification payload
- `options.data?`: Data payload

**Returns:** Message ID string

### Topic Management

#### `subscribeToTopic(tokens: string[], topic: string): Promise<TopicManagementResponse>`

Subscribe tokens vào một topic (tối đa 1000 tokens).

**Parameters:**

- `tokens`: Array of FCM tokens (max 1000)
- `topic`: Topic name

**Returns:** TopicManagementResponse with success/failure counts

#### `unsubscribeFromTopic(tokens: string[], topic: string): Promise<TopicManagementResponse>`

Unsubscribe tokens khỏi một topic.

**Parameters:**

- `tokens`: Array of FCM tokens (max 1000)
- `topic`: Topic name

**Returns:** TopicManagementResponse with success/failure counts

### Helper Methods

#### `createNotification(title: string, body: string, imageUrl?: string): NotificationPayload`

Tạo notification payload chuẩn.

**Parameters:**

- `title`: Tiêu đề thông báo
- `body`: Nội dung thông báo
- `imageUrl?`: URL hình ảnh (optional)

**Returns:** NotificationPayload object

#### `createAndroidConfig(options: AndroidConfigOptions): AndroidConfig`

Tạo Android-specific configuration.

**Parameters:**

- `options.priority?`: "normal" | "high"
- `options.ttl?`: Time to live in milliseconds
- `options.notification?`: Android notification options
- `options.data?`: Android data payload

#### `createApnsConfig(options: ApnsConfigOptions): ApnsConfig`

Tạo iOS/macOS-specific configuration.

**Parameters:**

- `options.headers?`: APNS headers
- `options.payload?`: APNS payload with aps object

#### `createWebPushConfig(options: WebPushConfigOptions): WebpushConfig`

Tạo Web Push configuration.

**Parameters:**

- `options.headers?`: Web Push headers
- `options.notification?`: Web notification options
- `options.fcmOptions?`: FCM-specific web options

## 🚨 Error Handling

Plugin sử dụng custom error class `FirebaseMessagingError` để xử lý lỗi một cách chi tiết:

```typescript
import { FirebaseMessagingError } from "./plugins/index.js";

try {
  await messaging.sendToToken(token, options);
} catch (error) {
  if (error instanceof FirebaseMessagingError) {
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);

    // Handle specific errors
    switch (error.code) {
      case "messaging/invalid-registration-token":
        // Token không hợp lệ - xóa khỏi database
        await removeTokenFromDatabase(token);
        break;
      case "messaging/registration-token-not-registered":
        // Token đã hết hạn - xóa khỏi database
        await removeTokenFromDatabase(token);
        break;
      case "messaging/invalid-argument":
        // Tham số không hợp lệ - kiểm tra input
        console.error("Invalid argument provided");
        break;
      case "messaging/authentication-error":
        // Lỗi xác thực - kiểm tra credentials
        console.error("Firebase authentication failed");
        break;
      default:
        // Các lỗi khác
        console.error("Unknown messaging error:", error.code);
    }
  } else {
    // Lỗi không phải từ Firebase Messaging
    console.error("Unexpected error:", error);
  }
}
```

### Common Error Codes

| Error Code                                    | Mô tả                          | Cách xử lý                    |
| --------------------------------------------- | ------------------------------ | ----------------------------- |
| `messaging/invalid-registration-token`        | Token không hợp lệ             | Xóa token khỏi database       |
| `messaging/registration-token-not-registered` | Token đã hết hạn               | Xóa token khỏi database       |
| `messaging/invalid-argument`                  | Tham số không hợp lệ           | Kiểm tra input data           |
| `messaging/authentication-error`              | Lỗi xác thực                   | Kiểm tra Firebase credentials |
| `messaging/server-unavailable`                | Server Firebase không khả dụng | Retry sau một thời gian       |
| `messaging/internal-error`                    | Lỗi nội bộ Firebase            | Retry hoặc báo cáo bug        |

## 📏 Giới hạn của Firebase

| Loại                    | Giới hạn                     | Mô tả                                                  |
| ----------------------- | ---------------------------- | ------------------------------------------------------ |
| **Multicast messages**  | 500 tokens/request           | Số lượng tokens tối đa trong một lần gửi multicast     |
| **Topic subscriptions** | 1000 tokens/request          | Số lượng tokens tối đa khi subscribe/unsubscribe topic |
| **Message size**        | 4KB                          | Kích thước tối đa của notification payload             |
| **Topic names**         | Pattern: `[a-zA-Z0-9-_.~%]+` | Chỉ chấp nhận ký tự chữ, số và một số ký tự đặc biệt   |
| **Condition length**    | 1000 characters              | Độ dài tối đa của condition string                     |
| **Data payload**        | 4KB                          | Kích thước tối đa của data payload                     |
| **Rate limiting**       | Varies by plan               | Giới hạn số request per second                         |

## 🧪 Testing

### Chạy Test Cấu hình

```bash
# Chạy test cấu hình Firebase
npm run test:firebase

# Hoặc chạy trực tiếp file test
node src/plugins/firebase-messaging.test.js
```

### Test với Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Cloud Messaging**
4. Click **Send your first message**
5. Test gửi message đến FCM token

## 💡 Ví dụ thực tế

### Tích hợp với Hono Routes

```typescript
import { Hono } from "hono";
import { FirebaseMessaging, firebaseConfig } from "./plugins/index.js";

const app = new Hono();

// Khởi tạo Firebase
await firebaseConfig.initialize();
const messaging = new FirebaseMessaging();

// Route gửi notification đến user
app.post("/api/notifications/send", async (c) => {
  try {
    const { userId, title, body, data } = await c.req.json();

    // Lấy FCM token từ database
    const userToken = await getUserFCMToken(userId);

    if (!userToken) {
      return c.json({ error: "User token not found" }, 404);
    }

    const messageId = await messaging.sendToToken(userToken, {
      notification: messaging.createNotification(title, body),
      data: data || {},
    });

    return c.json({ success: true, messageId });
  } catch (error) {
    console.error("Send notification error:", error);
    return c.json({ error: "Failed to send notification" }, 500);
  }
});

// Route gửi broadcast notification
app.post("/api/notifications/broadcast", async (c) => {
  try {
    const { topic, title, body } = await c.req.json();

    const messageId = await messaging.sendToTopic({
      topic,
      notification: messaging.createNotification(title, body),
      data: {
        type: "broadcast",
        timestamp: Date.now().toString(),
      },
    });

    return c.json({ success: true, messageId });
  } catch (error) {
    console.error("Broadcast error:", error);
    return c.json({ error: "Failed to send broadcast" }, 500);
  }
});
```

## 🎯 Best Practices

### 1. Token Management

```typescript
// Lưu token với metadata
interface UserToken {
  userId: string;
  fcmToken: string;
  platform: "ios" | "android" | "web";
  createdAt: Date;
  lastUsed: Date;
}

// Cleanup expired tokens
async function cleanupExpiredTokens() {
  const expiredTokens = await getExpiredTokens();
  for (const token of expiredTokens) {
    await removeTokenFromDatabase(token);
  }
}
```

### 2. Topic Naming Convention

```typescript
// ✅ Good topic names
const topics = [
  "news_general",
  "news_sports_football",
  "user_notifications_123",
  "app_updates",
];

// ❌ Bad topic names
const badTopics = [
  "news-general!", // Special characters
  "news general", // Spaces
  "news/sports", // Forward slash
];
```

### 3. Error Handling Strategy

```typescript
async function sendNotificationWithRetry(
  token: string,
  options: MessageOptions,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await messaging.sendToToken(token, options);
    } catch (error) {
      if (error instanceof FirebaseMessagingError) {
        // Don't retry for permanent errors
        if (
          error.code === "messaging/invalid-registration-token" ||
          error.code === "messaging/registration-token-not-registered"
        ) {
          await removeTokenFromDatabase(token);
          throw error;
        }

        // Retry for temporary errors
        if (attempt === maxRetries) throw error;
        await sleep(1000 * attempt); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}
```

### 4. Performance Optimization

```typescript
// Batch processing for multiple users
async function sendToMultipleUsers(
  userIds: string[],
  notification: NotificationPayload
) {
  const tokens = await getUserTokens(userIds);
  const chunks = chunkArray(tokens, 500); // Firebase limit

  const results = await Promise.allSettled(
    chunks.map((chunk) =>
      messaging.sendToMultipleTokens({
        tokens: chunk,
        notification,
      })
    )
  );

  return results;
}
```

## 🔧 Troubleshooting

### Common Issues và Solutions

#### 1. "Invalid token" errors

**Nguyên nhân:**

- Token đã expired hoặc không hợp lệ
- Device đã uninstall app
- Token từ environment khác (dev vs production)

**Giải pháp:**

```typescript
// Implement token validation
async function validateAndCleanTokens(tokens: string[]) {
  const validTokens = [];
  for (const token of tokens) {
    try {
      await messaging.sendToToken(token, {
        data: { test: "validation" },
      });
      validTokens.push(token);
    } catch (error) {
      if (
        error instanceof FirebaseMessagingError &&
        error.code === "messaging/invalid-registration-token"
      ) {
        await removeTokenFromDatabase(token);
      }
    }
  }
  return validTokens;
}
```

#### 2. "Topic name invalid" errors

**Nguyên nhân:**

- Topic chứa special characters không được phép
- Topic name quá dài

**Giải pháp:**

```typescript
function validateTopicName(topic: string): boolean {
  const pattern = /^[a-zA-Z0-9-_.~%]+$/;
  return pattern.test(topic) && topic.length <= 900;
}
```

#### 3. "Authentication error"

**Nguyên nhân:**

- Service account credentials không đúng
- Project ID không match với credentials
- Missing required environment variables

**Giải pháp:**

```bash
# Kiểm tra environment variables
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL
echo $FIREBASE_PRIVATE_KEY

# Verify service account file
cat path/to/serviceAccountKey.json | jq .project_id
```

#### 4. Rate Limiting

**Nguyên nhân:**

- Gửi quá nhiều requests trong thời gian ngắn

**Giải pháp:**

```typescript
// Implement rate limiting
import { RateLimiter } from "limiter";

const limiter = new RateLimiter(100, "minute"); // 100 requests per minute

async function sendWithRateLimit(token: string, options: MessageOptions) {
  await limiter.removeTokens(1);
  return messaging.sendToToken(token, options);
}
```

## 📚 Tài liệu tham khảo

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK for Node.js](https://firebase.google.com/docs/admin/setup)
- [FCM HTTP v1 API](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)
- [Hono Framework Documentation](https://hono.dev/)

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.
