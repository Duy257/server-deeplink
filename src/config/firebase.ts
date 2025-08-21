import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: admin.app.App | null = null;

  private constructor() {}

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (this.app) {
        console.log('Firebase Admin already initialized');
        return;
      }

      // Kiểm tra xem có service account key file không
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!projectId) {
        throw new Error('FIREBASE_PROJECT_ID environment variable is required');
      }

      let credential: admin.credential.Credential;

      if (serviceAccountPath) {
        // Sử dụng service account key file
        credential = admin.credential.cert(serviceAccountPath);
      } else {
        // Sử dụng service account key từ environment variables
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        if (!privateKey || !clientEmail) {
          throw new Error(
            'Either FIREBASE_SERVICE_ACCOUNT_PATH or both FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL must be provided'
          );
        }

        credential = admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        });
      }

      this.app = admin.initializeApp({
        credential,
        projectId,
      });

      console.log(`Firebase Admin initialized for project: ${projectId}`);
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }

  public getApp(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase Admin not initialized. Call initialize() first.');
    }
    return this.app;
  }

  public getMessaging(): admin.messaging.Messaging {
    return admin.messaging(this.getApp());
  }

  public getAuth(): admin.auth.Auth {
    return admin.auth(this.getApp());
  }

  public getFirestore(): admin.firestore.Firestore {
    return admin.firestore(this.getApp());
  }
}

export default FirebaseConfig.getInstance();
