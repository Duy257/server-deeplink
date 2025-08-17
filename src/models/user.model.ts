import { Collection, ObjectId, WithId } from "mongodb";
import database from "../config/database.js";
import {
  IUser,
  IUserInput,
  IUserUpdate,
  IUserResponse,
} from "../types/user.js";

class UserModel {
  private collection: Collection<IUser> | null = null;
  private indexesCreated = false;

  private async getCollection(): Promise<Collection<IUser>> {
    if (!this.collection) {
      this.collection = database.getDb().collection<IUser>("users");
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
        // Create unique index for email
        await this.collection.createIndex({ email: 1 }, { unique: true });
        console.log("User indexes created successfully");
      }
    } catch (error) {
      console.error("Error creating user indexes:", error);
    }
  }

  // Convert user document to response format (without password)
  private toResponse(user: WithId<IUser>): IUserResponse {
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      _id: user._id.toString(),
    };
  }

  // Create a new user
  async create(userData: IUserInput): Promise<IUserResponse> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      const user: IUser = {
        ...userData,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(user);
      const createdUser = await collection.findOne({ _id: result.insertedId });

      if (!createdUser) {
        throw new Error("Failed to create user");
      }

      return this.toResponse(createdUser);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("Email already exists");
      }
      throw error;
    }
  }

  // Find all users
  async findAll(filter: any = {}, options: any = {}): Promise<IUserResponse[]> {
    try {
      const collection = await this.getCollection();
      const users = await collection.find(filter, options).toArray();

      return users.map((user) => this.toResponse(user));
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  async findById(id: string): Promise<IUserResponse | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const collection = await this.getCollection();
      const user = await collection.findOne({ _id: new ObjectId(id) });

      if (!user) {
        return null;
      }

      return this.toResponse(user);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<WithId<IUser> | null> {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  // Update user by ID
  async update(
    id: string,
    updateData: IUserUpdate
  ): Promise<IUserResponse | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const collection = await this.getCollection();
      const updateDoc = {
        ...updateData,
        updatedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: "after" }
      );

      if (!result) {
        return null;
      }

      return this.toResponse(result);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("Email already exists");
      }
      throw error;
    }
  }

  // Delete user by ID
  async delete(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Count users
  async count(filter: any = {}): Promise<number> {
    try {
      const collection = await this.getCollection();
      return await collection.countDocuments(filter);
    } catch (error) {
      throw error;
    }
  }
}

export default UserModel;
