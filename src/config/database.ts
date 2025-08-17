import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private static instance: Database;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      if (this.client) {
        console.log('Already connected to MongoDB');
        return;
      }

      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hono_backend';
      const dbName = process.env.DATABASE_NAME || 'hono_backend';

      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db(dbName);

      console.log(`Connected to MongoDB database: ${dbName}`);

      // Handle application termination
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log('Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  public getClient(): MongoClient {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.client;
  }
}

export default Database.getInstance();
