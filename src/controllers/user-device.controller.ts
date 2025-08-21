import { Context } from "hono";
import UserDeviceModel from "../models/user-device.model.js";
import { IRegisterDeviceRequest, IUpdateDeviceRequest } from "../types/user-device.js";

class UserDeviceController {
  private userDeviceModel: UserDeviceModel;

  constructor() {
    this.userDeviceModel = new UserDeviceModel();
  }

  // Register or update a device
  async registerDevice(c: Context) {
    try {
      const deviceData: IRegisterDeviceRequest = await c.req.json();
      
      // For now, we'll use a dummy userId. In a real app, you'd get this from JWT token
      // TODO: Replace with actual user authentication
      const userId = c.req.header('x-user-id') || '507f1f77bcf86cd799439011'; // dummy ObjectId
      
      const device = await this.userDeviceModel.registerDevice({
        ...deviceData,
        userId,
      });

      return c.json({
        success: true,
        message: "Device registered successfully",
        data: device,
      }, 201);
    } catch (error: any) {
      console.error("Register device error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to register device",
      }, 500);
    }
  }

  // Get all devices for current user
  async getUserDevices(c: Context) {
    try {
      // TODO: Replace with actual user authentication
      const userId = c.req.header('x-user-id') || '507f1f77bcf86cd799439011';
      
      const devices = await this.userDeviceModel.findByUserId(userId);

      return c.json({
        success: true,
        message: "Devices retrieved successfully",
        data: devices,
        count: devices.length,
      });
    } catch (error: any) {
      console.error("Get user devices error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to get devices",
      }, 500);
    }
  }

  // Get device by FCM token
  async getDeviceByToken(c: Context) {
    try {
      const { fcmToken } = c.req.param();
      
      const device = await this.userDeviceModel.findByFcmToken(fcmToken);

      if (!device) {
        return c.json({
          success: false,
          message: "Device not found",
        }, 404);
      }

      return c.json({
        success: true,
        message: "Device retrieved successfully",
        data: device,
      });
    } catch (error: any) {
      console.error("Get device by token error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to get device",
      }, 500);
    }
  }

  // Update device
  async updateDevice(c: Context) {
    try {
      const { fcmToken } = c.req.param();
      const updateData: IUpdateDeviceRequest = await c.req.json();
      
      const device = await this.userDeviceModel.updateDevice(fcmToken, updateData);

      if (!device) {
        return c.json({
          success: false,
          message: "Device not found",
        }, 404);
      }

      return c.json({
        success: true,
        message: "Device updated successfully",
        data: device,
      });
    } catch (error: any) {
      console.error("Update device error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to update device",
      }, 500);
    }
  }

  // Update last used timestamp
  async updateLastUsed(c: Context) {
    try {
      const { fcmToken } = c.req.param();
      
      const updated = await this.userDeviceModel.updateLastUsed(fcmToken);

      if (!updated) {
        return c.json({
          success: false,
          message: "Device not found",
        }, 404);
      }

      return c.json({
        success: true,
        message: "Device last used updated successfully",
      });
    } catch (error: any) {
      console.error("Update last used error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to update last used",
      }, 500);
    }
  }

  // Deactivate device
  async deactivateDevice(c: Context) {
    try {
      const { fcmToken } = c.req.param();
      
      const deactivated = await this.userDeviceModel.deactivateDevice(fcmToken);

      if (!deactivated) {
        return c.json({
          success: false,
          message: "Device not found",
        }, 404);
      }

      return c.json({
        success: true,
        message: "Device deactivated successfully",
      });
    } catch (error: any) {
      console.error("Deactivate device error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to deactivate device",
      }, 500);
    }
  }

  // Remove device
  async removeDevice(c: Context) {
    try {
      const { fcmToken } = c.req.param();
      
      const removed = await this.userDeviceModel.removeDevice(fcmToken);

      if (!removed) {
        return c.json({
          success: false,
          message: "Device not found",
        }, 404);
      }

      return c.json({
        success: true,
        message: "Device removed successfully",
      });
    } catch (error: any) {
      console.error("Remove device error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to remove device",
      }, 500);
    }
  }

  // Get FCM tokens for a user (for sending notifications)
  async getUserFcmTokens(c: Context) {
    try {
      const { userId } = c.req.param();
      
      const tokens = await this.userDeviceModel.getUserFcmTokens(userId);

      return c.json({
        success: true,
        message: "FCM tokens retrieved successfully",
        data: tokens,
        count: tokens.length,
      });
    } catch (error: any) {
      console.error("Get user FCM tokens error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to get FCM tokens",
      }, 500);
    }
  }

  // Cleanup inactive devices
  async cleanupInactiveDevices(c: Context) {
    try {
      const daysOld = parseInt(c.req.query('days') || '30');
      
      const deletedCount = await this.userDeviceModel.cleanupInactiveDevices(daysOld);

      return c.json({
        success: true,
        message: `Cleanup completed. ${deletedCount} devices removed.`,
        deletedCount,
      });
    } catch (error: any) {
      console.error("Cleanup devices error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to cleanup devices",
      }, 500);
    }
  }

  // Get device statistics
  async getDeviceStats(c: Context) {
    try {
      const totalDevices = await this.userDeviceModel.count({ isActive: true });
      const iosDevices = await this.userDeviceModel.count({ platform: 'ios', isActive: true });
      const androidDevices = await this.userDeviceModel.count({ platform: 'android', isActive: true });
      const webDevices = await this.userDeviceModel.count({ platform: 'web', isActive: true });
      const inactiveDevices = await this.userDeviceModel.count({ isActive: false });

      return c.json({
        success: true,
        message: "Device statistics retrieved successfully",
        data: {
          total: totalDevices,
          active: totalDevices,
          inactive: inactiveDevices,
          platforms: {
            ios: iosDevices,
            android: androidDevices,
            web: webDevices,
          },
        },
      });
    } catch (error: any) {
      console.error("Get device stats error:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to get device statistics",
      }, 500);
    }
  }
}

export default new UserDeviceController();
