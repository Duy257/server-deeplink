import { z } from "zod";

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  age: z.number().min(1).max(120).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  age: z.number().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// UserDevice validation schemas
export const registerDeviceSchema = z.object({
  fcmToken: z.string().min(1, "FCM token is required"),
  platform: z.enum(["ios", "android", "web"], {
    errorMap: () => ({ message: "Platform must be ios, android, or web" }),
  }),
  deviceId: z.string().optional(),
  deviceName: z.string().max(100).optional(),
  appVersion: z.string().max(20).optional(),
  osVersion: z.string().max(20).optional(),
});

export const updateDeviceSchema = z.object({
  fcmToken: z.string().min(1).optional(),
  platform: z.enum(["ios", "android", "web"]).optional(),
  deviceId: z.string().optional(),
  deviceName: z.string().max(100).optional(),
  appVersion: z.string().max(20).optional(),
  osVersion: z.string().max(20).optional(),
});

export const fcmTokenParamSchema = z.object({
  fcmToken: z.string().min(1, "FCM token is required"),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
export type FcmTokenParam = z.infer<typeof fcmTokenParamSchema>;
