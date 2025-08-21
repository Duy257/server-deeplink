import { ObjectId } from 'mongodb';

export type DevicePlatform = 'ios' | 'android' | 'web';

export interface IUserDevice {
  _id?: ObjectId;
  userId: ObjectId;
  fcmToken: string;
  platform: DevicePlatform;
  deviceId?: string; // Unique device identifier
  deviceName?: string; // User-friendly device name
  appVersion?: string;
  osVersion?: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDeviceInput {
  userId: string;
  fcmToken: string;
  platform: DevicePlatform;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
  osVersion?: string;
}

export interface IUserDeviceUpdate {
  fcmToken?: string;
  platform?: DevicePlatform;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
  osVersion?: string;
  isActive?: boolean;
  lastUsed?: Date;
}

export interface IUserDeviceResponse {
  _id: string;
  userId: string;
  fcmToken: string;
  platform: DevicePlatform;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
  osVersion?: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

// For API requests
export interface IRegisterDeviceRequest {
  fcmToken: string;
  platform: DevicePlatform;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
  osVersion?: string;
}

export interface IUpdateDeviceRequest {
  fcmToken?: string;
  platform?: DevicePlatform;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
  osVersion?: string;
}
