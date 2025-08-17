"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const validation_1 = require("../utils/validation");
const userRoutes = new hono_1.Hono();
// Get all users with pagination
userRoutes.get('/', (0, zod_validator_1.zValidator)('query', validation_1.paginationSchema, (result, c) => {
    if (!result.success) {
        return c.json({
            success: false,
            message: 'Invalid query parameters',
            errors: result.error.issues,
        }, 400);
    }
}), (c) => user_controller_1.default.getUsers(c));
// Get user by ID
userRoutes.get('/:id', (0, zod_validator_1.zValidator)('param', validation_1.idParamSchema, (result, c) => {
    if (!result.success) {
        return c.json({
            success: false,
            message: 'Invalid user ID',
            errors: result.error.issues,
        }, 400);
    }
}), (c) => user_controller_1.default.getUserById(c));
// Create new user
userRoutes.post('/', (0, zod_validator_1.zValidator)('json', validation_1.createUserSchema, (result, c) => {
    if (!result.success) {
        return c.json({
            success: false,
            message: 'Validation error',
            errors: result.error.issues,
        }, 400);
    }
}), (c) => user_controller_1.default.createUser(c));
// Update user
userRoutes.put('/:id', (0, zod_validator_1.zValidator)('param', validation_1.idParamSchema, (result, c) => {
    if (!result.success) {
        return c.json({
            success: false,
            message: 'Invalid user ID',
            errors: result.error.issues,
        }, 400);
    }
}), (0, zod_validator_1.zValidator)('json', validation_1.updateUserSchema, (result, c) => {
    if (!result.success) {
        return c.json({
            success: false,
            message: 'Validation error',
            errors: result.error.issues,
        }, 400);
    }
}), (c) => user_controller_1.default.updateUser(c));
// Delete user
userRoutes.delete('/:id', (0, zod_validator_1.zValidator)('param', validation_1.idParamSchema, (result, c) => {
    if (!result.success) {
        return c.json({
            success: false,
            message: 'Invalid user ID',
            errors: result.error.issues,
        }, 400);
    }
}), (c) => user_controller_1.default.deleteUser(c));
exports.default = userRoutes;
