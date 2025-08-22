/**
 * Hàm test để gửi thông báo đến thiết bị Android
 * FCM Token: dUV26FPdSma91nxRjSzgvP:APA91bGeARCIJdURzpoIBilHtKVkgQ-V59O9EEL_1jg_kVLLDW6pDa2_YSdqQyNok6kCv5KU2mUnizPyVRDv9tdT_zXAkRrkSNL7Is5mAJRvy07Cz2nJM1s
 */

import { FirebaseMessaging } from "../plugins/firebase-messaging.js";
import firebaseConfig from "../config/firebase.js";

const FCM_TOKEN =
  "dUV26FPdSma91nxRjSzgvP:APA91bGeARCIJdURzpoIBilHtKVkgQ-V59O9EEL_1jg_kVLLDW6pDa2_YSdqQyNok6kCv5KU2mUnizPyVRDv9tdT_zXAkRrkSNL7Is5mAJRvy07Cz2nJM1s";

export async function testSendNotificationToAndroid() {
  console.log("🚀 Bắt đầu kiểm tra gửi thông báo cho thiết bị Android...");
  console.log(`📱 FCM Token đích: ${FCM_TOKEN.substring(0, 20)}...`);

  try {
    const firebaseMessaging = new FirebaseMessaging();

    // Test 1: Thông báo đơn giản
    console.log("\n📨 Test 1: Gửi thông báo đơn giản...");
    const simpleNotification = await firebaseMessaging.sendToToken(FCM_TOKEN, {
      notification: {
        title: "Thông báo kiểm tra",
        body: "Đây là một thông báo kiểm tra từ Hono MongoDB Backend",
        imageUrl:
          "https://via.placeholder.com/512x256/4285f4/ffffff?text=Test+Notification",
      },
    });
    console.log("✅ Gửi thông báo đơn giản thành công:", simpleNotification);

    // Test 2: Thông báo với dữ liệu tùy chỉnh
    console.log("\n📨 Test 2: Gửi thông báo với dữ liệu tùy chỉnh...");
    const dataNotification = await firebaseMessaging.sendToToken(FCM_TOKEN, {
      notification: {
        title: "Thông báo dữ liệu",
        body: "Thông báo này chứa dữ liệu tùy chỉnh",
      },
      data: {
        type: "test",
        action: "open_screen",
        screen: "home",
        timestamp: new Date().toISOString(),
        userId: "test_user_123",
      },
    });
    console.log("✅ Gửi thông báo dữ liệu thành công:", dataNotification);

    // Test 3: Thông báo dành riêng cho Android
    console.log("\n📨 Test 3: Gửi thông báo dành riêng cho Android...");
    const androidNotification = await firebaseMessaging.sendToToken(FCM_TOKEN, {
      notification: {
        title: "Thông báo Android",
        body: "Đây là một thông báo dành riêng cho Android với các cài đặt tùy chỉnh",
      },
      android: firebaseMessaging.createAndroidConfig({
        priority: "high",
        ttl: 3600000, // 1 hour
        collapseKey: "test_notification",
        notification: {
          icon: "ic_notification",
          color: "#4285f4",
          sound: "default",
          tag: "test_tag",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
          channelId: "default_channel",
          priority: "high",
          visibility: "public",
          notificationCount: 1,
        },
      }),
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        route: "/home",
      },
    });
    console.log("✅ Gửi thông báo Android thành công:", androidNotification);

    // Test 4: Thông báo có độ ưu tiên cao
    console.log("\n📨 Test 4: Gửi thông báo có độ ưu tiên cao...");
    const highPriorityNotification = await firebaseMessaging.sendToToken(
      FCM_TOKEN,
      {
        notification: {
          title: "Thông báo ưu tiên cao",
          body: "Đây là một thông báo có độ ưu tiên cao sẽ xuất hiện ngay lập tức",
        },
        android: {
          priority: "high",
          notification: {
            priority: "max",
            defaultSound: true,
            defaultVibrateTimings: true,
            defaultLightSettings: true,
            sticky: true,
          },
        },
        data: {
          priority: "high",
          alert_type: "urgent",
        },
      }
    );
    console.log(
      "✅ Gửi thông báo ưu tiên cao thành công:",
      highPriorityNotification
    );

    // Test 5: Tin nhắn dữ liệu ngầm (không có thông báo)
    console.log(
      "\n📨 Test 5: Gửi tin nhắn dữ liệu ngầm (không có thông báo)..."
    );
    const silentMessage = await firebaseMessaging.sendToToken(FCM_TOKEN, {
      data: {
        type: "silent_update",
        action: "sync_data",
        timestamp: new Date().toISOString(),
        background: "true",
      },
      android: {
        priority: "high",
      },
    });
    console.log("✅ Gửi tin nhắn dữ liệu ngầm thành công:", silentMessage);

    console.log(
      "\n🎉 Tất cả các bài kiểm tra thông báo đã hoàn thành thành công!"
    );
    return true;
  } catch (error) {
    console.error("❌ Lỗi trong quá trình kiểm tra thông báo:", error);
    if (error instanceof Error) {
      console.error("Tin nhắn lỗi:", error.message);
      console.error("Dấu vết lỗi:", error.stack);
    }
    return false;
  }
}

/**
 * Hàm test cho thông báo hàng loạt
 */
export async function testBatchNotifications() {
  console.log("\n📨 Bắt đầu kiểm tra thông báo hàng loạt...");

  try {
    const firebaseMessaging = new FirebaseMessaging();

    // Gửi đến nhiều token (bao gồm cả token test của chúng ta)
    const tokens = [FCM_TOKEN]; // Thêm nhiều token nếu có

    const batchResult = await firebaseMessaging.sendToMultipleTokens({
      tokens,
      notification: {
        title: "Thông báo hàng loạt",
        body: "Đây là một thông báo hàng loạt được gửi đến nhiều thiết bị",
      },
      data: {
        type: "batch",
        timestamp: new Date().toISOString(),
      },
    });

    console.log("✅ Kết quả thông báo hàng loạt:", {
      successCount: batchResult.successCount,
      failureCount: batchResult.failureCount,
    });

    return true;
  } catch (error) {
    console.error(
      "❌ Lỗi trong quá trình kiểm tra thông báo hàng loạt:",
      error
    );
    return false;
  }
}

/**
 * Hàm chạy test chính
 */
export async function runAllNotificationTests() {
  console.log("🧪 Bắt đầu tất cả các bài kiểm tra thông báo...\n");

  // Khởi tạo Firebase Admin SDK trước khi chạy các bài kiểm tra
  await firebaseConfig.initialize();

  const results = {
    singleNotification: await testSendNotificationToAndroid(),
    batchNotification: await testBatchNotifications(),
  };

  console.log("\n📊 Tóm tắt kết quả kiểm tra:");
  console.log(
    "Kiểm tra thông báo đơn lẻ:",
    results.singleNotification ? "✅ ĐẠT" : "❌ THẤT BẠI"
  );
  console.log(
    "Kiểm tra thông báo hàng loạt:",
    results.batchNotification ? "✅ ĐẠT" : "❌ THẤT BẠI"
  );

  const allPassed = Object.values(results).every((result) => result === true);
  console.log(
    `\nKết quả tổng thể: ${allPassed ? "✅ TẤT CẢ ĐÃ ĐẠT" : "⚠️ CÓ LỖI XẢY RA"}`
  );

  return results;
}

// Chạy kiểm tra nếu tệp này được thực thi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllNotificationTests()
    .then(() => {
      console.log("\n✨ Thực thi kiểm tra đã hoàn tất!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Thực thi kiểm tra thất bại:", error);
      process.exit(1);
    });
}
