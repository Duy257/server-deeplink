import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import UserModel from '../models/user.model';
import { CreateUserInput, UpdateUserInput } from '../utils/validation';

class UserController {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  // Get all users
  async getUsers(c: Context) {
    try {
      const { page = '1', limit = '10' } = c.req.query();
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const users = await this.userModel.findAll({}, { 
        skip, 
        limit: limitNum,
        projection: { password: 0 }
      });
      
      const total = await this.userModel.count();
      const totalPages = Math.ceil(total / limitNum);

      return c.json({
        success: true,
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  async getUserById(c: Context) {
    try {
      const id = c.req.param('id');
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new HTTPException(404, { message: 'User not found' });
      }

      return c.json({
        success: true,
        data: user,
      });
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  async createUser(c: Context) {
    try {
      const body = await c.req.json<CreateUserInput>();
      const user = await this.userModel.create(body);

      return c.json({
        success: true,
        message: 'User created successfully',
        data: user,
      }, 201);
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async updateUser(c: Context) {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<UpdateUserInput>();
      
      const user = await this.userModel.update(id, body);

      if (!user) {
        throw new HTTPException(404, { message: 'User not found' });
      }

      return c.json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  async deleteUser(c: Context) {
    try {
      const id = c.req.param('id');
      const deleted = await this.userModel.delete(id);

      if (!deleted) {
        throw new HTTPException(404, { message: 'User not found' });
      }

      return c.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new UserController();
