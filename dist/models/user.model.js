"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const database_1 = __importDefault(require("../config/database"));
class UserModel {
    collection = null;
    indexesCreated = false;
    async getCollection() {
        if (!this.collection) {
            this.collection = database_1.default.getDb().collection('users');
            if (!this.indexesCreated) {
                await this.createIndexes();
                this.indexesCreated = true;
            }
        }
        return this.collection;
    }
    async createIndexes() {
        try {
            if (this.collection) {
                // Create unique index for email
                await this.collection.createIndex({ email: 1 }, { unique: true });
                console.log('User indexes created successfully');
            }
        }
        catch (error) {
            console.error('Error creating user indexes:', error);
        }
    }
    // Convert user document to response format (without password)
    toResponse(user) {
        const { password, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            _id: user._id.toString(),
        };
    }
    // Create a new user
    async create(userData) {
        try {
            const collection = await this.getCollection();
            const now = new Date();
            const user = {
                ...userData,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            };
            const result = await collection.insertOne(user);
            const createdUser = await collection.findOne({ _id: result.insertedId });
            if (!createdUser) {
                throw new Error('Failed to create user');
            }
            return this.toResponse(createdUser);
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }
    // Find all users
    async findAll(filter = {}, options = {}) {
        try {
            const collection = await this.getCollection();
            const users = await collection
                .find(filter, options)
                .toArray();
            return users.map(user => this.toResponse(user));
        }
        catch (error) {
            throw error;
        }
    }
    // Find user by ID
    async findById(id) {
        try {
            if (!mongodb_1.ObjectId.isValid(id)) {
                return null;
            }
            const collection = await this.getCollection();
            const user = await collection.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!user) {
                return null;
            }
            return this.toResponse(user);
        }
        catch (error) {
            throw error;
        }
    }
    // Find user by email
    async findByEmail(email) {
        try {
            const collection = await this.getCollection();
            return await collection.findOne({ email });
        }
        catch (error) {
            throw error;
        }
    }
    // Update user by ID
    async update(id, updateData) {
        try {
            if (!mongodb_1.ObjectId.isValid(id)) {
                return null;
            }
            const collection = await this.getCollection();
            const updateDoc = {
                ...updateData,
                updatedAt: new Date(),
            };
            const result = await collection.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, { $set: updateDoc }, { returnDocument: 'after' });
            if (!result) {
                return null;
            }
            return this.toResponse(result);
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }
    // Delete user by ID
    async delete(id) {
        try {
            if (!mongodb_1.ObjectId.isValid(id)) {
                return false;
            }
            const collection = await this.getCollection();
            const result = await collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
            return result.deletedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    // Count users
    async count(filter = {}) {
        try {
            const collection = await this.getCollection();
            return await collection.countDocuments(filter);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = UserModel;
