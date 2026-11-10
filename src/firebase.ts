import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if configured
const rawConfig = firebaseConfig as Record<string, any>;
const firestoreDbId = rawConfig.firestoreDatabaseId;

export const db = firestoreDbId
  ? getFirestore(app, firestoreDbId)
  : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  code: string;
  message: string;
  operation: string;
  timestamp: string;
  operationType?: OperationType | string;
  path?: string | null;
  authInfo?: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operation: string,
  operationType: OperationType | string = OperationType.GET,
  path: string | null = null
): FirestoreErrorInfo {
  const err = error as { code?: string; message?: string };
  const info: FirestoreErrorInfo = {
    code: err.code || 'unknown',
    message: err.message || 'একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে',
    operation,
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    timestamp: new Date().toISOString(),
  };

  console.error(`Firestore [${operation}] ত্রুটি:`, JSON.stringify(info), error);
  return info;
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export default app;
