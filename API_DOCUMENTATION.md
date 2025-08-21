# Tài Liệu API - Quản Lý Thiết Bị & Firebase Messaging

## URL Gốc

```
http://localhost:3000/api/v1
```

## Xác Thực

Hiện tại sử dụng header để xác định user:

```
x-user-id: <user-id>
```

_Lưu ý: Trong production, thay thế bằng JWT authentication_

---

## 📱 Quản Lý Thiết Bị Người Dùng

### Đăng Ký Thiết Bị

Đăng ký hoặc cập nhật thiết bị của người dùng với FCM token.

**POST** `/devices/register`

**Headers:**

```
Content-Type: application/json
x-user-id: 507f1f77bcf86cd799439011
```

**Dữ liệu gửi:**

```json
{
  "fcmToken": "fcm-token-string",
  "platform": "ios", // "ios" | "android" | "web"
  "deviceId": "device-unique-id", // tùy chọn
  "deviceName": "iPhone 14 Pro", // tùy chọn
  "appVersion": "1.0.0", // tùy chọn
  "osVersion": "16.0" // tùy chọn
}
```

**Phản hồi:**

```json
{
  "success": true,
  "message": "Đăng ký thiết bị thành công",
  "data": {
    "_id": "device-id",
    "userId": "user-id",
    "fcmToken": "fcm-token-string",
    "platform": "ios",
    "deviceId": "device-unique-id",
    "deviceName": "iPhone 14 Pro",
    "appVersion": "1.0.0",
    "osVersion": "16.0",
    "isActive": true,
    "lastUsed": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Lấy Danh Sách Thiết Bị

Lấy tất cả thiết bị của người dùng hiện tại.

**GET** `/devices/`

**Headers:**

```
x-user-id: 507f1f77bcf86cd799439011
```

**Phản hồi:**

```json
{
  "success": true,
  "message": "Lấy danh sách thiết bị thành công",
  "data": [
    {
      "_id": "device-id",
      "userId": "user-id",
      "fcmToken": "fcm-token-string",
      "platform": "ios",
      "deviceName": "iPhone 14 Pro",
      "isActive": true,
      "lastUsed": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Lấy Thiết Bị Theo FCM Token

Lấy thông tin thiết bị bằng FCM token.

**GET** `/devices/token/:fcmToken`

**Phản hồi:**

```json
{
  "success": true,
  "message": "Lấy thông tin thiết bị thành công",
  "data": {
    "_id": "device-id",
    "userId": "user-id",
    "fcmToken": "fcm-token-string",
    "platform": "ios",
    "isActive": true
  }
}
```

### Cập Nhật Thiết Bị

Cập nhật thông tin thiết bị.

**PUT** `/devices/token/:fcmToken`

**Dữ liệu gửi:**

```json
{
  "deviceName": "Tên thiết bị mới",
  "appVersion": "1.1.0",
  "osVersion": "16.1"
}
```

### Vô Hiệu Hóa Thiết Bị

Xóa mềm thiết bị (đánh dấu không hoạt động).

**PATCH** `/devices/token/:fcmToken/deactivate`

**Phản hồi:**

```json
{
  "success": true,
  "message": "Vô hiệu hóa thiết bị thành công"
}
```

### Xóa Thiết Bị

Xóa vĩnh viễn thiết bị.

**DELETE** `/devices/token/:fcmToken`

**Phản hồi:**

```json
{
  "success": true,
  "message": "Xóa thiết bị thành công"
}
```

---

## 🔔 Firebase Messaging

### Gửi Thông Báo Đến Người Dùng

Gửi thông báo đến tất cả thiết bị của một người dùng cụ thể.

**POST** `/notifications/send-to-user`

**Dữ liệu gửi:**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "title": "Xin chào người dùng!",
  "body": "Đây là thông báo dành cho bạn",
  "imageUrl": "https://example.com/image.png", // tùy chọn
  "data": {
    // tùy chọn
    "type": "welcome",
    "action": "open_app"
  }
}
```

**Phản hồi:**

```json
{
  "success": true,
  "message": "Gửi thông báo đến người dùng thành công",
  "data": {
    "successCount": 2,
    "failureCount": 0,
    "totalTokens": 2
  }
}
```

### Gửi Thông Báo Đến Token

Gửi thông báo đến một FCM token cụ thể.

**POST** `/notifications/send-to-token`

**Dữ liệu gửi:**

```json
{
  "token": "fcm-token-string",
  "title": "Xin chào!",
  "body": "Đây là một thông báo",
  "imageUrl": "https://example.com/image.png", // tùy chọn
  "data": {
    // tùy chọn
    "key": "value"
  }
}
```

**Phản hồi:**

```json
{
  "success": true,
  "message": "Gửi thông báo thành công",
  "messageId": "firebase-message-id"
}
```

### Gửi Thông Báo Đến Nhiều Token

Gửi thông báo đến nhiều FCM token.

**POST** `/notifications/send-to-multiple`

**Dữ liệu gửi:**

```json
{
  "tokens": ["token1", "token2", "token3"],
  "title": "Tin nhắn quảng bá",
  "body": "Thông báo này được gửi đến nhiều thiết bị",
  "data": {
    "type": "broadcast"
  }
}
```

**Phản hồi:**

```json
{
  "success": true,
  "message": "Gửi thông báo multicast thành công",
  "successCount": 2,
  "failureCount": 1,
  "responses": [
    { "success": true, "messageId": "msg-id-1" },
    { "success": true, "messageId": "msg-id-2" },
    {
      "success": false,
      "error": { "code": "messaging/invalid-registration-token" }
    }
  ]
}
```

### Gửi Thông Báo Đến Topic

Gửi thông báo đến một Firebase topic.

**POST** `/notifications/send-to-topic`

**Dữ liệu gửi:**

```json
{
  "topic": "news-updates",
  "title": "Tin Nóng",
  "body": "Cập nhật tin tức quan trọng",
  "data": {
    "category": "news",
    "priority": "high"
  }
}
```

**Phản hồi:**

```json
{
  "success": true,
  "message": "Gửi thông báo topic thành công",
  "messageId": "firebase-message-id"
}
```

### Đăng Ký Topic

Đăng ký FCM tokens vào một topic.

**POST** `/notifications/subscribe-to-topic`

**Dữ liệu gửi:**

```json
{
  "tokens": ["token1", "token2"],
  "topic": "news-updates"
}
```

**Phản hồi:**

```json
{
  "success": true,
  "message": "Đăng ký tokens vào topic thành công",
  "successCount": 2,
  "failureCount": 0
}
```

### Hủy Đăng Ký Topic

Hủy đăng ký FCM tokens khỏi một topic.

**POST** `/notifications/unsubscribe-from-topic`

**Dữ liệu gửi:**

```json
{
  "tokens": ["token1", "token2"],
  "topic": "news-updates"
}
```

---

## 📊 Endpoints Quản Trị

### Lấy FCM Tokens Của Người Dùng

Lấy tất cả FCM tokens của một người dùng cụ thể (chỉ admin).

**GET** `/devices/user/:userId/tokens`

**Phản hồi:**

```json
{
  "success": true,
  "message": "Lấy FCM tokens thành công",
  "data": ["token1", "token2", "token3"],
  "count": 3
}
```

### Thống Kê Thiết Bị

Lấy thống kê thiết bị (chỉ admin).

**GET** `/devices/stats`

**Phản hồi:**

```json
{
  "success": true,
  "message": "Lấy thống kê thiết bị thành công",
  "data": {
    "total": 150,
    "active": 145,
    "inactive": 5,
    "platforms": {
      "ios": 80,
      "android": 60,
      "web": 5
    }
  }
}
```

### Dọn Dẹp Thiết Bị Không Hoạt Động

Xóa các thiết bị không hoạt động (chỉ admin).

**DELETE** `/devices/cleanup?days=30`

**Phản hồi:**

```json
{
  "success": true,
  "message": "Dọn dẹp hoàn tất. Đã xóa 10 thiết bị.",
  "deletedCount": 10
}
```

---

## Phản Hồi Lỗi

### Lỗi Validation

```json
{
  "success": false,
  "message": "Lỗi validation",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["fcmToken"],
      "message": "FCM token là bắt buộc"
    }
  ]
}
```

### Không Tìm Thấy

```json
{
  "success": false,
  "message": "Không tìm thấy thiết bị"
}
```

### Lỗi Server

```json
{
  "success": false,
  "message": "Gửi thông báo thất bại",
  "error": "messaging/invalid-registration-token"
}
```
