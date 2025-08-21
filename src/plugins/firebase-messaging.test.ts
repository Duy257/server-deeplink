import { FirebaseMessaging } from "./firebase-messaging.js";
import firebaseConfig from "../config/firebase.js";

/**
 * File kiểm tra để test cấu hình Firebase Messaging
 * Chạy file này để kiểm tra cấu hình Firebase
 */

async function kiemTraFirebaseMessaging() {
  try {
    console.log("🔥 Đang kiểm tra cấu hình Firebase Messaging...\n");

    // 1. Kiểm tra khởi tạo Firebase
    console.log("1. Đang khởi tạo Firebase...");
    await firebaseConfig.initialize();
    console.log("✅ Khởi tạo Firebase thành công\n");

    // 2. Kiểm tra tạo instance FirebaseMessaging
    console.log("2. Đang tạo instance FirebaseMessaging...");
    const messaging = new FirebaseMessaging();
    console.log("✅ Tạo instance FirebaseMessaging thành công\n");

    // 3. Kiểm tra tạo thông báo
    console.log("3. Đang kiểm tra tạo thông báo...");
    const notification = messaging.createNotification(
      "Thông Báo Kiểm Tra",
      "Đây là một thông báo kiểm tra",
      "https://example.com/test-image.png"
    );
    console.log("✅ Tạo thông báo thành công:", notification);
    console.log("");

    // 4. Kiểm tra tạo cấu hình Android
    console.log("4. Đang kiểm tra tạo cấu hình Android...");
    const androidConfig = messaging.createAndroidConfig({
      priority: "high",
      ttl: 3600000,
      notification: {
        icon: "test_icon",
        color: "#ff0000",
        sound: "default",
      },
    });
    console.log("✅ Tạo cấu hình Android thành công");
    console.log("");

    // 5. Kiểm tra tạo cấu hình APNS (iOS)
    console.log("5. Đang kiểm tra tạo cấu hình APNS (iOS)...");
    const apnsConfig = messaging.createApnsConfig({
      headers: {
        "apns-priority": "10",
      },
      payload: {
        aps: {
          alert: {
            title: "Kiểm Tra iOS",
            body: "Thông báo kiểm tra iOS",
          },
          badge: 1,
        },
      },
    });
    console.log("✅ Tạo cấu hình APNS thành công");
    console.log("");

    // 6. Kiểm tra tạo cấu hình Web Push
    console.log("6. Đang kiểm tra tạo cấu hình Web Push...");
    const webpushConfig = messaging.createWebPushConfig({
      headers: {
        TTL: "300",
      },
      notification: {
        title: "Kiểm Tra Web",
        body: "Thông báo kiểm tra web",
      },
    });
    console.log("✅ Tạo cấu hình Web Push thành công");
    console.log("");

    console.log("🎉 Tất cả các kiểm tra Firebase Messaging đều thành công!");
    console.log("\n📝 Các bước tiếp theo:");
    console.log(
      "1. Thêm thông tin xác thực Firebase service account vào file .env"
    );
    console.log("2. Lấy FCM tokens từ ứng dụng mobile/web của bạn");
    console.log(
      "3. Sử dụng các phương thức messaging để gửi thông báo thực tế"
    );
    console.log("\n💡 Ví dụ sử dụng:");
    console.log(
      'await messaging.sendToToken("fcm-token-của-bạn", { notification });'
    );
  } catch (error) {
    console.error("❌ Kiểm tra Firebase Messaging thất bại:", error);
    console.log("\n🔧 Khắc phục sự cố:");
    console.log(
      "1. Kiểm tra xem FIREBASE_PROJECT_ID đã được thiết lập trong file .env chưa"
    );
    console.log(
      "2. Kiểm tra thông tin xác thực Firebase service account có đúng không"
    );
    console.log("3. Đảm bảo package firebase-admin đã được cài đặt");
    console.log("4. Xác minh cài đặt Firebase project của bạn");
  }
}

// Chạy kiểm tra nếu file này được thực thi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  kiemTraFirebaseMessaging();
}

export { kiemTraFirebaseMessaging };
