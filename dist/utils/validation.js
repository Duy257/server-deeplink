"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.idParamSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
// User validation schemas
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    age: zod_1.z.number().min(1).max(120).optional(),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50).optional(),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(6).optional(),
    age: zod_1.z.number().min(1).max(120).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
});
// Pagination schemas
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional(),
    order: zod_1.z.enum(['asc', 'desc']).optional(),
});
