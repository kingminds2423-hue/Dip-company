import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebase';
import { Staff, AdminAuth, UserSession } from '../types';

const SESSION_KEY = 'dip_bhola_user_session';

export function getStoredSession(): UserSession {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading stored session:', e);
  }
  // Default to Admin for seamless first view if not set, or we can prompt login
  return {
    role: 'admin',
    id: 'admin',
    name: 'জাহিদুল ইসলাম (পরিচালক)',
    designation: 'প্রধান পরিচালক',
    phone: '01721200049'
  };
}

export function saveSession(session: UserSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// Check PIN and authenticate
export function authenticateWithPin(
  pin: string,
  adminAuth: AdminAuth | null,
  staffs: Staff[]
): UserSession | null {
  const cleanPin = pin.trim();

  // Check Admin PIN (default 1234 from backup)
  const actualAdminPin = adminAuth?.pin || '1234';
  if (cleanPin === actualAdminPin) {
    return {
      role: 'admin',
      id: 'admin',
      name: 'জাহিদুল ইসলাম (পরিচালক)',
      designation: 'প্রধান পরিচালক ও অংশীদার',
      phone: adminAuth?.phone || '01721200049'
    };
  }

  // Check Staff PINs
  const matchedStaff = staffs.find((s) => s.pin.trim() === cleanPin);
  if (matchedStaff) {
    return {
      role: 'staff',
      id: matchedStaff.id,
      name: matchedStaff.name,
      designation: matchedStaff.designation || 'টেকনিশিয়ান',
      phone: matchedStaff.phone
    };
  }

  return null;
}

// Authenticate via Firebase Email & Password
export async function authenticateWithEmailPassword(email: string, pass: string): Promise<UserSession> {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    const session: UserSession = {
      role: 'admin',
      id: res.user.uid,
      name: res.user.displayName || email.split('@')[0],
      designation: 'অ্যাডমিন ইউজার',
      phone: res.user.phoneNumber || ''
    };
    saveSession(session);
    return session;
  } catch (error: any) {
    // If user not found, attempt creation if it's admin email
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const createRes = await createUserWithEmailAndPassword(auth, email, pass);
        const session: UserSession = {
          role: 'admin',
          id: createRes.user.uid,
          name: email.split('@')[0],
          designation: 'অ্যাডমিন ইউজার',
        };
        saveSession(session);
        return session;
      } catch (innerErr) {
        throw error;
      }
    }
    throw error;
  }
}

export async function logoutUser() {
  saveSession(null);
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Sign out error:', e);
  }
}

export function subscribeToFirebaseAuthState(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
