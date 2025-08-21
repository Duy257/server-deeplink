# Hướng Dẫn Sử Dụng - Hệ Thống Quản Lý Thiết Bị & Firebase Messaging

## 📋 Tổng Quan

Hệ thống này cung cấp một giải pháp hoàn chỉnh để quản lý thiết bị người dùng và gửi push notifications thông qua Firebase Cloud Messaging (FCM). Được xây dựng trên nền tảng Hono với MongoDB backend.

## 🚀 Tính Năng Chính

### 📱 Quản Lý Thiết Bị
- ✅ Đăng ký/cập nhật thiết bị với FCM token
- ✅ Hỗ trợ đa nền tảng: iOS, Android, Web
- ✅ Theo dõi trạng thái hoạt động của thiết bị
- ✅ Tự động dọn dẹp thiết bị không hoạt động
- ✅ Thống kê thiết bị theo platform

### 🔔 Firebase Messaging
- ✅ Gửi thông báo đến người dùng cụ thể
- ✅ Gửi thông báo đến nhiều thiết bị (multicast)
- ✅ Gửi thông báo theo topic
- ✅ Gửi thông báo theo điều kiện
- ✅ Hỗ trợ platform-specific configurations
- ✅ Xử lý lỗi và invalid tokens tự động

## 🛠️ Cài Đặt

### 1. Cài Đặt Dependencies
```bash
npm install firebase-admin
```

### 2. Cấu Hình Firebase
1. Tạo project Firebase tại [Firebase Console](https://console.firebase.google.com/)
2. Tạo Service Account Key
3. Cấu hình environment variables:

```env
# Bắt buộc
FIREBASE_PROJECT_ID=your-project-id

# Tùy chọn 1: Sử dụng Service Account file
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json

# Tùy chọn 2: Sử dụng environment variables
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### 3. Khởi Động Server
```bash
npm start
```

## 📚 Tài Liệu API

### Endpoints Chính

#### Quản Lý Thiết Bị
- `POST /api/v1/devices/register` - Đăng ký thiết bị
- `GET /api/v1/devices/` - Lấy danh sách thiết bị
- `PUT /api/v1/devices/token/:fcmToken` - Cập nhật thiết bị
- `DELETE /api/v1/devices/token/:fcmToken` - Xóa thiết bị

#### Gửi Thông Báo
- `POST /api/v1/notifications/send-to-user` - Gửi đến người dùng
- `POST /api/v1/notifications/send-to-token` - Gửi đến token cụ thể
- `POST /api/v1/notifications/send-to-topic` - Gửi đến topic

#### Quản Trị
- `GET /api/v1/devices/stats` - Thống kê thiết bị
- `DELETE /api/v1/devices/cleanup` - Dọn dẹp thiết bị không hoạt động

## 🔧 Sử Dụng Cơ Bản

### 1. Đăng Ký Thiết Bị (Client)

```javascript
// Web
const deviceData = {
  fcmToken: "fcm-token-string",
  platform: "web",
  deviceName: "Chrome Browser",
  appVersion: "1.0.0"
};

fetch('/api/v1/devices/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'user-id-here'
  },
  body: JSON.stringify(deviceData)
});
```

### 2. Gửi Thông Báo (Server)

```javascript
// Gửi đến người dùng cụ thể
const notificationData = {
  userId: "user-id",
  title: "Xin chào!",
  body: "Đây là thông báo test",
  data: {
    type: "test",
    action: "open_app"
  }
};

fetch('/api/v1/notifications/send-to-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(notificationData)
});
```

## 📖 Tài Liệu Chi Tiết

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Tài liệu API đầy đủ
- **[VI_DU_SU_DUNG.md](./VI_DU_SU_DUNG.md)** - Ví dụ tích hợp client/server
- **[src/plugins/firebase-messaging.README.md](./src/plugins/firebase-messaging.README.md)** - Hướng dẫn Firebase Messaging plugin

## 🔍 Testing

### Chạy Test Cấu Hình
```bash
npm run test:firebase
# hoặc
node src/plugins/firebase-messaging.test.js
```

### Test API với cURL
```bash
# Đăng ký thiết bị
curl -X POST http://localhost:3000/api/v1/devices/register \
  -H "Content-Type: application/json" \
  -H "x-user-id: 507f1f77bcf86cd799439011" \
  -d '{
    "fcmToken": "test-token",
    "platform": "web",
    "deviceName": "Test Device"
  }'

# Gửi thông báo
curl -X POST http://localhost:3000/api/v1/notifications/send-to-user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "title": "Test Notification",
    "body": "This is a test message"
  }'
```

## 🚨 Xử Lý Lỗi

### Lỗi Thường Gặp

1. **"Invalid FCM token"**
   - Token đã hết hạn hoặc không hợp lệ
   - Hệ thống sẽ tự động deactivate token

2. **"Authentication error"**
   - Kiểm tra Firebase credentials
   - Đảm bảo Project ID đúng

3. **"Topic name invalid"**
   - Topic name chỉ chấp nhận: `[a-zA-Z0-9-_.~%]+`

## 📊 Monitoring

### Thống Kê Thiết Bị
```bash
curl http://localhost:3000/api/v1/devices/stats
```

### Dọn Dẹp Thiết Bị (Cron Job)
```bash
# Xóa thiết bị không hoạt động > 30 ngày
curl -X DELETE "http://localhost:3000/api/v1/devices/cleanup?days=30"
```

## 🔐 Bảo Mật

### Production Checklist
- [ ] Thay thế `x-user-id` header bằng JWT authentication
- [ ] Cấu hình rate limiting
- [ ] Setup HTTPS
- [ ] Validate input data
- [ ] Monitor và log activities
- [ ] Backup device data

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [Troubleshooting Guide](./src/plugins/firebase-messaging.README.md#troubleshooting)
2. Xem [Issues](https://github.com/your-repo/issues) hiện có
3. Tạo issue mới với thông tin chi tiết

---

**Phiên bản:** 1.0.0  
**Cập nhật lần cuối:** 2024-01-01
