import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Cloud,
  FileSpreadsheet,
  ExternalLink,
  ShieldCheck,
  Check,
  Calendar,
  Lock,
  LogOut
} from 'lucide-react';
import {
  Company,
  Partner,
  Staff,
  Transaction,
  CustomerDue,
  AdminAuth
} from '../types';
import {
  generateBackupJson,
  seedInitialDataIfEmpty,
  generateCsvData
} from '../services/dataService';
import {
  initGoogleAuth,
  googleSignIn,
  googleLogout,
  getAccessToken,
  uploadFullBackupToDrive,
  uploadMonthlyA4StatementToDrive,
  uploadCsvStatementToDrive,
  listDriveBackups,
  DriveFileInfo
} from '../services/googleDriveService';
import { toBengaliNumber, formatCurrency, formatBengaliDate } from '../utils/formatters';
import { User } from 'firebase/auth';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  partners: Partner[];
  staffs: Staff[];
  transactions: Transaction[];
  customerDues: CustomerDue[];
  adminAuth: AdminAuth | null;
  onRefreshData: () => Promise<void>;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  company,
  partners,
  staffs,
  transactions,
  customerDues,
  adminAuth,
  onRefreshData,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Google Drive Auth state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Auto Monthly A4 Backup Setting (stored locally)
  const [autoMonthlyA4Backup, setAutoMonthlyA4Backup] = useState<boolean>(() => {
    return localStorage.getItem('dip_bhola_auto_drive_a4') !== 'false';
  });

  useEffect(() => {
    if (!isOpen) return;

    // Listen to Google Auth
    const unsub = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setDriveToken(token);
        fetchDriveFiles(token);
      },
      () => {
        setGoogleUser(null);
        setDriveToken(null);
        setDriveFiles([]);
      }
    );

    return () => unsub();
  }, [isOpen]);

  const fetchDriveFiles = async (token: string) => {
    setIsLoadingFiles(true);
    try {
      const files = await listDriveBackups(token);
      setDriveFiles(files);
    } catch (e) {
      console.warn('Failed to load drive files:', e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  if (!isOpen) return null;

  const companyName = company?.name || 'DIP BHOLA NETWORK';
  const ownerName = company?.ownerName || 'জাহিদুল ইসলাম';

  // Handle Google Drive Sign-In
  const handleGoogleDriveConnect = async () => {
    setIsConnectingDrive(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setDriveToken(res.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Google Drive সফলভাবে সংযুক্ত হয়েছে (${res.user.email})`
        });
        await fetchDriveFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Drive sign in failed:', err);
      setStatusMessage({
        type: 'error',
        text: 'Google Drive সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
      });
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleGoogleDriveDisconnect = async () => {
    await googleLogout();
    setGoogleUser(null);
    setDriveToken(null);
    setDriveFiles([]);
    setStatusMessage({ type: 'success', text: 'Google Drive সংযোগ বিচ্ছিন্ন করা হয়েছে।' });
  };

  const toggleAutoA4 = (enabled: boolean) => {
    setAutoMonthlyA4Backup(enabled);
    localStorage.setItem('dip_bhola_auto_drive_a4', enabled ? 'true' : 'false');
  };

  // Build Full Backup Object
  const getFullBackupData = () => {
    return generateBackupJson(
      company || {
        name: 'DIP BHOLA NETWORK',
        subTitle: 'দৈনিক আয়-ব্যয় ও কেন্দ্রীয় স্টাফ মনিটরিং সিস্টেম',
        ownerName: 'জাহিদুল ইসলাম',
        phone: '01721200049',
        email: 'zahidulislam53330@gmail.com',
        address: '৩নং পশ্চিম ইলিশা।ভোলা সদর ভোলা',
        currencySymbol: '৳'
      },
      partners,
      adminAuth || { pin: '1234', phone: '01700000000' },
      staffs,
      transactions,
      customerDues
    );
  };

  // 1. Upload Full Database Backup to Google Drive
  const handleUploadBackupToDrive = async () => {
    if (!driveToken) {
      handleGoogleDriveConnect();
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage(null);
      const backupData = getFullBackupData();
      const fileInfo = await uploadFullBackupToDrive(driveToken, backupData);
      setStatusMessage({
        type: 'success',
        text: `Google Drive-এ সম্পূর্ণ ব্যাকআপ সফলভাবে আপলোড হয়েছে! ফাইল: ${fileInfo.name}`
      });
      await fetchDriveFiles(driveToken);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Google Drive-এ ব্যাকআপ আপলোডে সমস্যা হয়েছে।'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Upload Monthly A4 Financial Statement to Google Drive
  const handleUploadMonthlyA4ToDrive = async () => {
    if (!driveToken) {
      handleGoogleDriveConnect();
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage(null);
      const todayStr = new Date().toISOString().split('T')[0];
      const targetMonth = todayStr.substring(0, 7);

      // Filter month transactions
      const monthTx = transactions.filter((t) => t.date && t.date.startsWith(targetMonth));
      const totalInc = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const totalExp = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const net = totalInc - totalExp;

      // Generate Clean A4 Print-ready HTML Statement
      const a4Html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${companyName} - মাসিক আর্থিক বিবরণী (${targetMonth})</title>
  <style>
    body { font-family: 'Hind Siliguri', Arial, sans-serif; margin: 25px; color: #1e293b; line-height: 1.5; font-size: 11pt; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    h1 { margin: 0; font-size: 24pt; color: #0f172a; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; }
    .kpi { background: #fff; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center; }
    .kpi-title { font-size: 9pt; color: #64748b; font-weight: bold; }
    .kpi-val { font-size: 14pt; font-weight: bold; margin-top: 4px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 9pt; }
    th { background: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
    td { padding: 7px 8px; border: 1px solid #e2e8f0; }
    .footer-signs { margin-top: 45px; display: flex; justify-content: space-between; text-align: center; page-break-inside: avoid; }
    .sign-box { width: 180px; border-top: 1px solid #000; padding-top: 5px; font-weight: bold; font-size: 10pt; }
    @media print { @page { size: A4 portrait; margin: 10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${companyName}</h1>
      <p style="margin:2px 0; font-size: 10pt;">${company?.subTitle || 'ডিজিটাল নেটওয়ার্ক ও ইন্টারনেট ব্রডব্যান্ড সেবা'}</p>
      <p style="margin:2px 0; font-size: 9pt; color: #64748b;">ঠিকানা: ${company?.address || 'ভোলা সদর'} | মোবাইল: ${company?.phone || '০১৭২১২০০০৪৯'}</p>
    </div>
    <div style="text-align: right; font-size: 10pt;">
      <div style="font-weight: bold; font-size: 12pt;">মাসিক আর্থিক বিবরণী (A4)</div>
      <div>হিসাবের মাস: ${targetMonth}</div>
      <div>তারিখ: ${todayStr}</div>
      <div>পরিচালক: ${ownerName}</div>
    </div>
  </div>

  <div class="summary">
    <div class="kpi"><div class="kpi-title">মোট লেনদেন</div><div class="kpi-val">${monthTx.length} টি</div></div>
    <div class="kpi"><div class="kpi-title">মোট আয়</div><div class="kpi-val" style="color:#059669;">৳ ${totalInc.toLocaleString()}</div></div>
    <div class="kpi"><div class="kpi-title">মোট ব্যয়</div><div class="kpi-val" style="color:#e11d48;">৳ ${totalExp.toLocaleString()}</div></div>
    <div class="kpi"><div class="kpi-title">নিট ব্যালেন্স</div><div class="kpi-val">৳ ${net.toLocaleString()}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>ক্রমিক</th>
        <th>তারিখ</th>
        <th>ধরন</th>
        <th>খাত / বিবরণ</th>
        <th>ক্যাটাগরি</th>
        <th style="text-align:right;">টাকা</th>
        <th>পেমেন্ট</th>
        <th>এন্ট্রিদাতা</th>
      </tr>
    </thead>
    <tbody>
      ${monthTx.map((t, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${t.date}</td>
          <td style="font-weight:bold; color:${t.type === 'income' ? '#059669' : '#e11d48'};">${t.type === 'income' ? 'আয়' : 'ব্যয়'}</td>
          <td>${t.title}</td>
          <td>${t.category}</td>
          <td style="text-align:right; font-weight:bold;">৳ ${t.amount.toLocaleString()}</td>
          <td>${t.paymentMethod}</td>
          <td>${t.addedBy}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer-signs">
    <div class="sign-box">শাখা / জেনারেল ম্যানেজার</div>
    <div class="sign-box">হিসাব নিরীক্ষক (অডিট)</div>
    <div class="sign-box">শেয়ার অংশীদারবৃন্দ</div>
    <div class="sign-box">প্রধান পরিচালক (সিইও)</div>
  </div>
</body>
</html>`;

      const fileInfo = await uploadMonthlyA4StatementToDrive(
        driveToken,
        a4Html,
        targetMonth,
        companyName
      );

      // Also upload CSV
      const csvData = generateCsvData(monthTx, companyName, targetMonth);
      await uploadCsvStatementToDrive(driveToken, csvData, targetMonth);

      setStatusMessage({
        type: 'success',
        text: `চলতি মাস (${targetMonth}) এর A4 সাইজ আর্থিক বিবরণী ও CSV গুগল ড্রাইভে সংরক্ষিত হয়েছে!`
      });
      await fetchDriveFiles(driveToken);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'A4 স্টেটমেন্ট আপলোডে সমস্যা হয়েছে।'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Local JSON Download
  const handleDownloadBackup = () => {
    try {
      const backupData = getFullBackupData();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `hisab_khata_full_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({ type: 'success', text: 'সম্পূর্ণ ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে।' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'ব্যাকআপ ফাইল ডাউনলোডে সমস্যা হয়েছে।' });
    }
  };

  // Restore Seed
  const handleRestoreFromAttachment = async () => {
    if (!confirm('আপনি কি পূর্ববর্তী এটাচমেন্ট ব্যাকআপ ডাটা দিয়ে ফায়ারবেস পুনরায় সিঙ্ক করতে চান?')) return;
    try {
      setIsProcessing(true);
      setStatusMessage(null);
      await seedInitialDataIfEmpty(true);
      await onRefreshData();
      setStatusMessage({ type: 'success', text: 'ফায়ারবেসে ব্যাকআপ ডাটা সফলভাবে রিস্টোর হয়েছে!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'রিস্টোরে সমস্যা হয়েছে।' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Google Drive ব্যাকআপ ও মাসিক A4 স্টেটমেন্ট সিস্টেম</span>
              </h3>
              <p className="text-xs text-slate-400">
                স্বয়ংক্রিয় ক্লাউড ব্যাকআপ, Google Drive সিঙ্ক্রোনাইজেশন ও A4 প্রিন্ট ক্লোজিং
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium'
                  : 'bg-rose-50 text-rose-900 border border-rose-200 font-medium'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 1: GOOGLE DRIVE CONNECTION & AUTO SYSTEM */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-2 shrink-0 flex items-center justify-center shadow-md">
                  {/* Google Drive Official Colors Logo */}
                  <svg className="w-full h-full" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335"/>
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.25z" fill="#00832d"/>
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-white">Google Drive ব্যাকআপ সিস্টেম</h4>
                    {googleUser ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        সংযুক্ত
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                        সংযুক্ত নেই
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {googleUser
                      ? `অ্যাকাউন্ট: ${googleUser.email || googleUser.displayName}`
                      : 'আপনার Google অ্যাকাউন্টের সাথে নিরাপদে যুক্ত করুন'}
                  </p>
                </div>
              </div>

              {/* Connect / Disconnect Button */}
              {googleUser ? (
                <button
                  onClick={handleGoogleDriveDisconnect}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  সংযোগ বিচ্ছিন্ন
                </button>
              ) : (
                /* Official Sign in with Google Button as per Skill Rules */
                <button
                  onClick={handleGoogleDriveConnect}
                  disabled={isConnectingDrive}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>{isConnectingDrive ? 'সংযোগ হচ্ছে...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>

            {/* Google Drive Action Buttons */}
            {googleUser && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-indigo-900/80">
                <button
                  onClick={handleUploadBackupToDrive}
                  disabled={isProcessing}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Cloud className="w-4 h-4" />
                  <span>গুগল ড্রাইভে সম্পূর্ণ ব্যাকআপ সেভ করুন</span>
                </button>

                <button
                  onClick={handleUploadMonthlyA4ToDrive}
                  disabled={isProcessing}
                  className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                  <span>মাসিক A4 স্টেটমেন্ট ড্রাইভে সেভ করুন</span>
                </button>
              </div>
            )}

            {/* Auto System Toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoMonthlyA4Backup}
                  onChange={(e) => toggleAutoA4(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-200 font-semibold">
                  প্রতি মাসের শেষে স্বয়ংক্রিয়ভাবে Google Drive-এ A4 সাইজ হিসাব বিবরণী সেভ করুন
                </span>
              </label>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                অটো সক্রিয়
              </span>
            </div>
          </div>

          {/* Drive Files List in User's Folder */}
          {googleUser && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Google Drive-এ সংরক্ষিত ফাইলসমূহ (DIP BHOLA NETWORK ফোল্ডার):</span>
                </div>
                <button
                  onClick={() => driveToken && fetchDriveFiles(driveToken)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  রিফ্রেশ
                </button>
              </div>

              {driveFiles.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-[11px]">
                  এখনো কোনো ব্যাকআপ ফাইল আপলোড করা হয়নি। উপরের বাটনে ক্লিক করে আপলোড করুন।
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white overflow-hidden max-h-36 overflow-y-auto">
                  {driveFiles.map((file) => (
                    <div key={file.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          আপলোড: {file.modifiedTime ? file.modifiedTime.substring(0, 10) : ''}
                        </div>
                      </div>
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                          ড্রাইভে দেখুন
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current Database Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
            <div className="font-bold text-slate-900 mb-1">বর্তমানে ফায়ারবেস ক্লাউডে সংরক্ষিত রেকর্ড:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">লেনদেন</span>
                <span className="font-bold text-slate-900 text-sm">{toBengaliNumber(transactions.length)} টি</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">কর্মকর্তা/স্টাফ</span>
                <span className="font-bold text-slate-900 text-sm">{toBengaliNumber(staffs.length)} জন</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">অংশীদার</span>
                <span className="font-bold text-slate-900 text-sm">{toBengaliNumber(partners.length)} জন</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">বাকি খাতা</span>
                <span className="font-bold text-slate-900 text-sm">{toBengaliNumber(customerDues.length)} জন</span>
              </div>
            </div>
          </div>

          {/* Offline JSON Download and Reset Sync Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Download Offline */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>অফলাইন ব্যাকআপ ফাইল ডাউনলোড (JSON)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  কম্পিউটার বা ফোনে সম্পূর্ণ হিসাব খাতার অফলাইন কপি সংরক্ষণ করুন।
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                ফাইল ডাউনলোড করুন
              </button>
            </div>

            {/* Seed Sync */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  <span>ফায়ারবেস ডাটা সিঙ্ক ও রিস্টোর</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ক্লাউড ডেটাবেস পুনরায় ডিফল্ট রেকর্ড দিয়ে সিঙ্ক করতে ক্লিক করুন।
                </p>
              </div>
              <button
                onClick={handleRestoreFromAttachment}
                disabled={isProcessing}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                {isProcessing ? 'সিঙ্ক হচ্ছে...' : 'ডাটা সিঙ্ক করুন'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
