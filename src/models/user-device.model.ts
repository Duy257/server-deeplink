import { Collection, ObjectId, WithId } from "mongodb";
import database from "../config/database.js";
import {
  IUserDevice,
  IUserDeviceInput,
  IUserDeviceUpdate,
  IUserDeviceResponse,
  DevicePlatform,
} from "../types/user-device.js";

class UserDeviceModel {
  private collection: Collection<IUserDevice> | null = null;
  private indexesCreated = false;

  private async getCollection(): Promise<Collection<IUserDevice>> {
    if (!this.collection) {
      this.collection = database
        .getDb()
        .collection<IUserDevice>("user_devices");
      if (!this.indexesCreated) {
        await this.createIndexes();
        this.indexesCreated = true;
      }
    }
    return this.collection!;
  }

  private async createIndexes(): Promise<void> {
    try {
      if (this.collection) {
        // Create unique index for fcmToken
        await this.collection.createIndex({ fcmToken: 1 }, { unique: true });

        // Create compound index for userId and platform
        await this.collection.createIndex({ userId: 1, platform: 1 });

        // Create index for userId
        await this.collection.createIndex({ userId: 1 });

        // Create index for deviceId (if provided)
        await this.collection.createIndex({ deviceId: 1 }, { sparse: true });

        // Create index for isActive and lastUsed for cleanup queries
        await this.collection.createIndex({ isActive: 1, lastUsed: 1 });

        console.log("UserDevice indexes created successfully");
      }
    } catch (error) {
      console.error("Error creating user device indexes:", error);
    }
  }

  // Convert device document to response format
  private toResponse(device: WithId<IUserDevice>): IUserDeviceResponse {
    return {
      _id: device._id.toString(),
      userId: device.userId.toString(),
      fcmToken: device.fcmToken,
      platform: device.platform,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      appVersion: device.appVersion,
      osVersion: device.osVersion,
      isActive: device.isActive,
      lastUsed: device.lastUsed,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    };
  }

  // Register or update a device
  async registerDevice(
    deviceData: IUserDeviceInput
  ): Promise<IUserDeviceResponse> {
    try {
      const collection = await this.getCollection();
      const now = new Date();

      // Check if device with same fcmToken already exists
      const existingDevice = await collection.findOne({
        fcmToken: deviceData.fcmToken,
      });

      if (existingDevice) {
        // Update existing device
        const updateDoc: IUserDeviceUpdate = {
          userId: new ObjectId(deviceData.userId),
          platform: deviceData.platform,
          deviceId: deviceData.deviceId,
          deviceName: deviceData.deviceName,
          appVersion: deviceData.appVersion,
          osVersion: deviceData.osVersion,
          isActive: true,
          lastUsed: now,
          updatedAt: now,
        };

        const result = await collection.findOneAndUpdate(
          { fcmToken: deviceData.fcmToken },
          { $set: updateDoc },
          { returnDocument: "after" }
        );

        if (!result) {
          throw new Error("Failed to update device");
        }

        return this.toResponse(result);
      } else {
        // Create new device
        const device: IUserDevice = {
          userId: new ObjectId(deviceData.userId),
          fcmToken: deviceData.fcmToken,
          platform: deviceData.platform,
          deviceId: deviceData.deviceId,
          deviceName: deviceData.deviceName,
          appVersion: deviceData.appVersion,
          osVersion: deviceData.osVersion,
          isActive: true,
          lastUsed: now,
          createdAt: now,
          updatedAt: now,
        };

        const result = await collection.insertOne(device);
        const createdDevice = await collection.findOne({
          _id: result.insertedId,
        });

        if (!createdDevice) {
          throw new Error("Failed to create device");
        }

        return this.toResponse(createdDevice);
      }
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("FCM token already exists");
      }
      throw error;
    }
  }

  // Get all devices for a user
  async findByUserId(userId: string): Promise<IUserDeviceResponse[]> {
    try {
      if (!ObjectId.isValid(userId)) {
        return [];
      }

      const collection = await this.getCollection();
      const devices = await collection
        .find({ userId: new ObjectId(userId), isActive: true })
        .sort({ lastUsed: -1 })
        .toArray();

      return devices.map((device) => this.toResponse(device));
    } catch (error) {
      throw error;
    }
  }

  // Get device by FCM token
  async findByFcmToken(fcmToken: string): Promise<IUserDeviceResponse | null> {
    try {
      const collection = await this.getCollection();
      const device = await collection.findOne({ fcmToken, isActive: true });

      if (!device) {
        return null;
      }

      return this.toResponse(device);
    } catch (error) {
      throw error;
    }
  }

  // Update device
  async updateDevice(
    fcmToken: string,
    updateData: IUserDeviceUpdate
  ): Promise<IUserDeviceResponse | null> {
    try {
      const collection = await this.getCollection();
      const updateDoc = {
        ...updateData,
        updatedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { fcmToken, isActive: true },
        { $set: updateDoc },
        { returnDocument: "after" }
      );

      if (!result) {
        return null;
      }

      return this.toResponse(result);
    } catch (error) {
      throw error;
    }
  }

  // Update last used timestamp
  async updateLastUsed(fcmToken: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { fcmToken, isActive: true },
        { $set: { lastUsed: new Date(), updatedAt: new Date() } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Deactivate device (soft delete)
  async deactivateDevice(fcmToken: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { fcmToken },
        { $set: { isActive: false, updatedAt: new Date() } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Remove device completely
  async removeDevice(fcmToken: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ fcmToken });
      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all FCM tokens for a user (for sending notifications)
  async getUserFcmTokens(userId: string): Promise<string[]> {
    try {
      if (!ObjectId.isValid(userId)) {
        return [];
      }

      const collection = await this.getCollection();
      const devices = await collection
        .find(
          { userId: new ObjectId(userId), isActive: true },
          { projection: { fcmToken: 1 } }
        )
        .toArray();

      return devices.map((device) => device.fcmToken);
    } catch (error) {
      throw error;
    }
  }

  // Get FCM tokens by platform
  async getFcmTokensByPlatform(platform: DevicePlatform): Promise<string[]> {
    try {
      const collection = await this.getCollection();
      const devices = await collection
        .find({ platform, isActive: true }, { projection: { fcmToken: 1 } })
        .toArray();

      return devices.map((device) => device.fcmToken);
    } catch (error) {
      throw error;
    }
  }

  // Cleanup inactive devices (older than specified days)
  async cleanupInactiveDevices(daysOld: number = 30): Promise<number> {
    try {
      const collection = await this.getCollection();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await collection.deleteMany({
        $or: [{ isActive: false }, { lastUsed: { $lt: cutoffDate } }],
      });

      return result.deletedCount;
    } catch (error) {
      throw error;
    }
  }

  // Count devices
  async count(filter: any = {}): Promise<number> {
    try {
      const collection = await this.getCollection();
      return await collection.countDocuments(filter);
    } catch (error) {
      throw error;
    }
  }
}

export default UserDeviceModel;
