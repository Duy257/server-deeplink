// Firebase Messaging Plugin
export { FirebaseMessaging } from './firebase-messaging.js';
export type {
  NotificationPayload,
  DataPayload,
  MessageOptions,
  MulticastMessageOptions,
  TopicMessageOptions,
  ConditionMessageOptions,
} from './firebase-messaging.js';

// Firebase Messaging Examples
export { FirebaseMessagingExample, messagingExample } from './firebase-messaging.example.js';

// Firebase Config
export { default as firebaseConfig } from '../config/firebase.js';
