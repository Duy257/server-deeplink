import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import userController from "../controllers/user.controller.js";
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
  paginationSchema,
} from "../utils/validation.js";

const userRoutes = new Hono();

// Get all users with pagination
userRoutes.get(
  "/",
  zValidator("query", paginationSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid query parameters",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userController.getUsers(c)
);

// Get user by ID
userRoutes.get(
  "/:id",
  zValidator("param", idParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid user ID",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userController.getUserById(c)
);

// Create new user
userRoutes.post(
  "/",
  zValidator("json", createUserSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Validation error",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userController.createUser(c)
);

// Update user
userRoutes.put(
  "/:id",
  zValidator("param", idParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid user ID",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  zValidator("json", updateUserSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Validation error",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userController.updateUser(c)
);

// Delete user
userRoutes.delete(
  "/:id",
  zValidator("param", idParamSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Invalid user ID",
          errors: result.error.issues,
        },
        400
      );
    }
  }),
  (c) => userController.deleteUser(c)
);

export default userRoutes;
