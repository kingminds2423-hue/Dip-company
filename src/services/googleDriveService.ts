import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase';
import { BackupData } from '../types';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account'
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && !user.isAnonymous) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('গুগল ড্রাইভ অ্যাক্সেস টোকেন পাওয়া যায়নি');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Google Drive API Helpers
const BACKUP_FOLDER_NAME = 'DIP BHOLA NETWORK - ক্লাউড হিসাব ব্যাকআপ';

// Get or Create dedicated Google Drive folder
export async function getOrCreateDriveFolder(accessToken: string): Promise<string> {
  const query = `name = '${BACKUP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!searchRes.ok) {
    throw new Error('গুগল ড্রাইভ ফোল্ডার সার্চে ব্যর্থ হয়েছে');
  }

  const data = await searchRes.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: BACKUP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'DIP BHOLA NETWORK স্বয়ংক্রিয় ক্লাউড ব্যাকআপ ও মাসিক A4 আর্থিক বিবরণী ফোল্ডার'
    })
  });

  if (!createRes.ok) {
    throw new Error('গুগল ড্রাইভে নতুন ফোল্ডার তৈরিতে ব্যর্থ হয়েছে');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
}

// Multipart file upload to Google Drive
async function uploadMultipartFile(
  accessToken: string,
  metadata: { name: string; mimeType: string; parents?: string[]; description?: string },
  content: string,
  contentType: string
): Promise<DriveFileInfo> {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${contentType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('Drive upload failed:', errText);
    throw new Error(`গুগল ড্রাইভে ফাইল আপলোড ব্যর্থ: ${res.statusText}`);
  }

  return await res.json();
}

// 1. Upload Full Database Backup JSON to Google Drive
export async function uploadFullBackupToDrive(
  accessToken: string,
  backupData: BackupData
): Promise<DriveFileInfo> {
  const folderId = await getOrCreateDriveFolder(accessToken);
  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const fileName = `dip_bhola_full_backup_${todayStr}_${timeStr}.json`;
  const jsonContent = JSON.stringify(backupData, null, 2);

  return await uploadMultipartFile(
    accessToken,
    {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
      description: `DIP BHOLA NETWORK পূর্ণাঙ্গ হিসাব খাতা ব্যাকআপ (${todayStr})`
    },
    jsonContent,
    'application/json'
  );
}

// 2. Upload Monthly A4 Financial Statement (HTML/Print-Ready) to Google Drive
export async function uploadMonthlyA4StatementToDrive(
  accessToken: string,
  htmlContent: string,
  monthStr: string,
  companyName: string
): Promise<DriveFileInfo> {
  const folderId = await getOrCreateDriveFolder(accessToken);
  const fileName = `mashik_a4_statement_${monthStr}_${companyName.replace(/\s+/g, '_')}.html`;

  return await uploadMultipartFile(
    accessToken,
    {
      name: fileName,
      mimeType: 'text/html',
      parents: [folderId],
      description: `DIP BHOLA NETWORK মাসিক A4 সাইজ আর্থিক বিবরণী প্রতিবেদন (${monthStr})`
    },
    htmlContent,
    'text/html; charset=UTF-8'
  );
}

// 3. Upload Monthly CSV Ledger to Google Drive
export async function uploadCsvStatementToDrive(
  accessToken: string,
  csvContent: string,
  monthStr: string
): Promise<DriveFileInfo> {
  const folderId = await getOrCreateDriveFolder(accessToken);
  const fileName = `mashik_ledger_${monthStr}.csv`;

  return await uploadMultipartFile(
    accessToken,
    {
      name: fileName,
      mimeType: 'text/csv',
      parents: [folderId],
      description: `DIP BHOLA NETWORK মাসিক লেনদেন লেজার CSV (${monthStr})`
    },
    csvContent,
    'text/csv; charset=UTF-8'
  );
}

// 4. List Files in Backup Folder
export async function listDriveBackups(accessToken: string): Promise<DriveFileInfo[]> {
  try {
    const folderId = await getOrCreateDriveFolder(accessToken);
    const query = `'${folderId}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Failed to list drive files:', err);
    return [];
  }
}
