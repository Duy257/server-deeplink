import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  age?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  name: string;
  email: string;
  password: string;
  age?: number;
}

export interface IUserUpdate {
  name?: string;
  email?: string;
  password?: string;
  age?: number;
  isActive?: boolean;
}

export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
