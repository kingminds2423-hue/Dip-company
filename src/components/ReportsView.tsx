import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle,
  Clock,
  PieChart,
  FileText,
  ShieldCheck,
  PenLine,
  Users,
  Settings,
  RotateCcw,
  Check,
  Award,
  BadgeCheck,
  UserCheck,
  Cloud
} from 'lucide-react';
import { Transaction, Company, Partner, Staff, OfficersState } from '../types';
import { formatCurrency, toBengaliNumber, formatBengaliDate } from '../utils/formatters';
import {
  getAccessToken,
  googleSignIn,
  uploadMonthlyA4StatementToDrive,
  uploadCsvStatementToDrive
} from '../services/googleDriveService';
import { generateCsvData } from '../services/dataService';

interface ReportsViewProps {
  transactions: Transaction[];
  company: Company | null;
  partners?: Partner[];
  staffs?: Staff[];
  officers?: OfficersState;
  onExportCsv: (monthStr?: string) => void;
}

interface SignatoryConfig {
  directorName: string;
  directorTitle: string;
  auditorName: string;
  auditorTitle: string;
  auditorRemarks: string;
  managerName: string;
  managerTitle: string;
  showPartnerShares: boolean;
  showSealStamp: boolean;
  statementDate: string;
}

const STORAGE_KEY = 'dip_bhola_report_signatories_v2';

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  company,
  partners = [],
  staffs = [],
  officers,
  onExportCsv,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    if (transactions.length > 0 && transactions[0].date) {
      return transactions[0].date.substring(0, 7);
    }
    return new Date().toISOString().split('T')[0].substring(0, 7);
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-detect manager from staffs list if exists
  const detectedManager = useMemo(() => {
    const mgr = staffs.find(
      (s) =>
        s.designation?.toLowerCase().includes('ম্যানেজার') ||
        s.designation?.toLowerCase().includes('manager')
    );
    return mgr ? `${mgr.name} (ম্যানেজার)` : 'মোঃ সাইফুল ইসলাম';
  }, [staffs]);

  // Signatory State with LocalStorage persistence
  const [signatories, setSignatories] = useState<SignatoryConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      directorName: company?.ownerName || 'জাহিদুল ইসলাম',
      directorTitle: 'প্রধান পরিচালক ও ব্যবস্থাপনা অংশীদার',
      auditorName: 'মোঃ কাওসার আহমেদ',
      auditorTitle: 'অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট কর্মকর্তা)',
      auditorRemarks: 'চলতি মাসের সকল আয়-ব্যয়ের ভাউচার, ক্যাশ মেমো ও হিসাব বহি পুঙ্খানুপুঙ্খভাবে অডিট করে সঠিক ও নির্ভুল পাওয়া গেল।',
      managerName: 'মোঃ সাইফুল ইসলাম',
      managerTitle: 'শাখা / জেনারেল ম্যানেজার',
      showPartnerShares: true,
      showSealStamp: true,
      statementDate: new Date().toISOString().split('T')[0]
    };
  });

  // Sync director, manager and auditor if company or officers change
  useEffect(() => {
    setSignatories((prev) => ({
      ...prev,
      directorName: company?.ownerName || prev.directorName,
      managerName: officers?.manager?.name || prev.managerName,
      managerTitle: officers?.manager?.designation || prev.managerTitle,
      auditorName: officers?.auditor?.name || prev.auditorName,
      auditorTitle: officers?.auditor?.designation || prev.auditorTitle,
      auditorRemarks: officers?.auditor?.scopeOfWork
        ? `হিসাব নিরীক্ষা প্রতিবেদন: ${officers.auditor.scopeOfWork}`
        : prev.auditorRemarks
    }));
  }, [company?.ownerName, officers]);

  const updateSignatory = (field: keyof SignatoryConfig, value: string | boolean) => {
    setSignatories((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const resetSignatoriesToDefault = () => {
    const def: SignatoryConfig = {
      directorName: company?.ownerName || 'জাহিদুল ইসলাম',
      directorTitle: 'প্রধান পরিচালক ও ব্যবস্থাপনা অংশীদার',
      auditorName: 'মোঃ কাওসার আহমেদ',
      auditorTitle: 'অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট কর্মকর্তা)',
      auditorRemarks: 'চলতি মাসের সকল আয়-ব্যয়ের ভাউচার, ক্যাশ মেমো ও হিসাব বহি পুঙ্খানুপুঙ্খভাবে অডিট করে সঠিক ও নির্ভুল পাওয়া গেল।',
      managerName: detectedManager,
      managerTitle: 'শাখা / জেনারেল ম্যানেজার',
      showPartnerShares: true,
      showSealStamp: true,
      statementDate: new Date().toISOString().split('T')[0]
    };
    setSignatories(def);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(def));
    } catch {
      // ignore
    }
  };

  // Distinct months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        months.add(tx.date.substring(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Transactions for selected month
  const monthTransactions = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter((tx) => tx.date && tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Calculations
  const summary = useMemo(() => {
    let inc = 0;
    let exp = 0;
    const catBreakdown: Record<string, { income: number; expense: number }> = {};

    monthTransactions.forEach((tx) => {
      const isIncome = tx.type === 'income';
      if (isIncome) {
        inc += tx.amount;
      } else {
        exp += tx.amount;
      }

      if (!catBreakdown[tx.category]) {
        catBreakdown[tx.category] = { income: 0, expense: 0 };
      }
      if (isIncome) {
        catBreakdown[tx.category].income += tx.amount;
      } else {
        catBreakdown[tx.category].expense += tx.amount;
      }
    });

    return {
      totalRecords: monthTransactions.length,
      totalIncome: inc,
      totalExpense: exp,
      netBalance: inc - exp,
      catBreakdown
    };
  }, [monthTransactions]);

  // Effective partners (fallback if empty)
  const effectivePartners = useMemo(() => {
    if (partners && partners.length > 0) return partners;
    return [
      {
        id: 'p-1',
        name: company?.ownerName || 'জাহিদুল ইসলাম',
        phone: company?.phone || '01721200049',
        role: 'প্রধান পরিচালক ও অংশীদার',
        investment: 600000,
        sharePercentage: 60,
        investmentHistory: []
      },
      {
        id: 'p-2',
        name: 'মোঃ হাবিবুর রহমান',
        phone: '01700000000',
        role: 'সহযোগী অংশীদার',
        investment: 400000,
        sharePercentage: 40,
        investmentHistory: []
      }
    ];
  }, [partners, company]);

  const [isDriveUploading, setIsDriveUploading] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState(false);

  const handleUploadA4ToDrive = async () => {
    let token = getAccessToken();
    if (!token) {
      try {
        const res = await googleSignIn();
        if (res) token = res.accessToken;
      } catch {
        alert('Google Drive সংযোগ করা যায়নি।');
        return;
      }
    }
    if (!token) return;

    setIsDriveUploading(true);
    try {
      const monthStr = selectedMonth === 'all' ? todayStr.substring(0, 7) : selectedMonth;
      const statementEl = document.getElementById('printable-financial-statement');
      const htmlBody = statementEl ? statementEl.innerHTML : '';
      
      const fullHtmlDoc = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>${companyName} - A4 আর্থিক বিবরণী (${monthStr})</title><style>body { font-family: 'Hind Siliguri', Arial, sans-serif; margin: 25px; color: #1e293b; font-size: 10pt; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #cbd5e1; padding: 6px 8px; } th { background: #f8fafc; font-weight: bold; } .page-break-avoid { page-break-inside: avoid; } @media print { @page { size: A4 portrait; margin: 10mm; } }</style></head><body>${htmlBody}</body></html>`;

      await uploadMonthlyA4StatementToDrive(token, fullHtmlDoc, monthStr, companyName);
      const csvStr = generateCsvData(monthTransactions, companyName, monthStr);
      await uploadCsvStatementToDrive(token, csvStr, monthStr);

      setDriveUploadSuccess(true);
      setTimeout(() => setDriveUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert('Google Drive-এ A4 স্টেটমেন্ট আপলোডে সমস্যা হয়েছে।');
    } finally {
      setIsDriveUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const companyName = company?.name || 'DIP BHOLA NETWORK';
  const ownerName = company?.ownerName || 'জাহিদুল ইসলাম';
  const phone = company?.phone || '01721200049';
  const address = company?.address || '৩নং পশ্চিম ইলিশা।ভোলা সদর ভোলা';

  return (
    <div className="space-y-6">
      {/* Top Header Card (Hidden when printing) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>আর্থিক সারসংক্ষেপ ও মাসিক অডিট প্রতিবেদন (Financial Reports)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            পরিচালক, অডিটর, ম্যানেজার ও অংশীদারদের নাম ও স্বাক্ষরসহ অফিসিয়াল স্টেটমেন্ট
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Month Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-800 focus:ring-0 cursor-pointer font-bold"
            >
              <option value="all">সর্বমোট সময় (All Time)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  মাস: {toBengaliNumber(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Signatories Edit Panel */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 ${
              isSettingsOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="রিপোর্টে প্রদর্শিত পরিচালক, অডিটর, ম্যানেজার ও স্বাক্ষরের তথ্য পরিবর্তন করুন"
          >
            <PenLine className="w-3.5 h-3.5 text-emerald-600" />
            <span>স্বাক্ষরকারী এডিট</span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={() => onExportCsv(selectedMonth === 'all' ? undefined : selectedMonth)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 flex items-center gap-1.5"
            title="CSV ফাইল ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
            CSV ডাউনলোড
          </button>

          {/* Google Drive A4 Backup Button */}
          <button
            onClick={handleUploadA4ToDrive}
            disabled={isDriveUploading}
            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            title="চলতি মাসের A4 সাইজ হিসাব স্টেটমেন্টটি সরাসরি আপনার Google Drive ফোল্ডারে সেভ করুন"
          >
            <Cloud className={`w-3.5 h-3.5 ${isDriveUploading ? 'animate-bounce' : ''}`} />
            <span>{isDriveUploading ? 'ড্রাইভে সেভ হচ্ছে...' : driveUploadSuccess ? 'ড্রাইভে সংরক্ষিত!' : 'ড্রাইভে A4 সেভ'}</span>
          </button>

          {/* Primary Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            title="প্রিন্টার-ফ্রেন্ডলি লেআউটে স্বাক্ষরসহ পূর্ণাঙ্গ মাসিক স্টেটমেন্ট প্রিন্ট বা PDF করুন"
          >
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>প্রিন্ট করুন (Print Statement)</span>
          </button>
        </div>
      </div>

      {/* Interactive Signatory Customization Drawer (Hidden when printing) */}
      {isSettingsOpen && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4 print:hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PenLine className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                রিপোর্টে স্বাক্ষরকারী কর্মকর্তাদের নাম ও অনুমোদন তথ্য কাস্টমাইজ করুন
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetSignatoriesToDefault}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                title="ডিফল্ট নামে রিসেট করুন"
              >
                <RotateCcw className="w-3 h-3" />
                রিসেট
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* 1. পরিচালক */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4" />
                <span>১. পরিচালক (Director)</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">পরিচালকের নাম:</label>
                <input
                  type="text"
                  value={signatories.directorName}
                  onChange={(e) => updateSignatory('directorName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:ring-1 focus:ring-emerald-500"
                  placeholder="পরিচালকের নাম"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">পদবী:</label>
                <input
                  type="text"
                  value={signatories.directorTitle}
                  onChange={(e) => updateSignatory('directorTitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500"
                  placeholder="পদবী"
                />
              </div>
            </div>

            {/* 2. অডিট */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>২. অডিট কর্মকর্তা (Auditor)</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">অডিটর এর নাম:</label>
                <input
                  type="text"
                  value={signatories.auditorName}
                  onChange={(e) => updateSignatory('auditorName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:ring-1 focus:ring-amber-500"
                  placeholder="অডিটর এর নাম"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">পদবী:</label>
                <input
                  type="text"
                  value={signatories.auditorTitle}
                  onChange={(e) => updateSignatory('auditorTitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-amber-500"
                  placeholder="পদবী"
                />
              </div>
            </div>

            {/* 3. ম্যানেজার */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>৩. ম্যানেজার (Manager)</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ম্যানেজার এর নাম:</label>
                <input
                  type="text"
                  value={signatories.managerName}
                  onChange={(e) => updateSignatory('managerName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:ring-1 focus:ring-cyan-500"
                  placeholder="ম্যানেজার এর নাম"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">পদবী:</label>
                <input
                  type="text"
                  value={signatories.managerTitle}
                  onChange={(e) => updateSignatory('managerTitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500"
                  placeholder="পদবী"
                />
              </div>
            </div>
          </div>

          {/* Audit Note & Display Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-800">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">অডিট নিরীক্ষণ মন্তব্য / নোট:</label>
              <textarea
                value={signatories.auditorRemarks}
                onChange={(e) => updateSignatory('auditorRemarks', e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div className="flex flex-col justify-center space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={signatories.showPartnerShares}
                  onChange={(e) => updateSignatory('showPartnerShares', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <span>অংশীদারদের লাভ-লোকসান বণ্টন হিসাব স্বাক্ষর বক্সে প্রদর্শন করুন</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={signatories.showSealStamp}
                  onChange={(e) => updateSignatory('showSealStamp', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <span>অফিসিয়াল গোল সিলমোহর ও ভেরিফিকেশন স্ট্যাম্প প্রদর্শন করুন</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Official Financial Statement Document (Optimized for Screen & Print) */}
      <div id="printable-financial-statement" className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0 print:space-y-4 print-container">
        {/* Printable Letterhead Header */}
        <div className="border-b-2 border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0 print:border-slate-400">
              <img
                src={company?.logoUrl || '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg'}
                alt={companyName}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {companyName}
              </h1>
              <p className="text-xs text-slate-700 font-semibold">{company?.subTitle || 'ডিজিটাল নেটওয়ার্ক ও ইন্টারনেট ব্রডব্যান্ড সেবা'}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                ঠিকানা: {address} | মোবাইল: {phone}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 bg-slate-50 print:bg-transparent p-3 rounded-xl border border-slate-200 print:border-none print:p-0">
            <div className="font-extrabold text-slate-900 text-sm mb-1 uppercase tracking-wider">
              মাসিক আর্থিক ও অডিট বিবরণী
            </div>
            <div>হিসাবের মাস: <span className="font-bold text-slate-900">{selectedMonth === 'all' ? 'সর্বমোট সময়' : toBengaliNumber(selectedMonth)}</span></div>
            <div>প্রিন্ট / স্টেটমেন্ট তারিখ: <span className="font-bold text-slate-900">{formatBengaliDate(todayStr)}</span></div>
            <div>প্রধান পরিচালক: <span className="font-bold text-slate-900">{signatories.directorName}</span></div>
          </div>
        </div>

        {/* Financial Summary KPI Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 print:bg-white p-4 rounded-xl border border-slate-200 print:border-slate-800 print:p-3">
          <div className="p-3 bg-white print:bg-white rounded-lg border border-slate-200 shadow-2xs print:border-slate-400">
            <div className="text-[11px] font-semibold text-slate-500 print:text-slate-800">মোট লেনদেন সংখ্যা</div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {toBengaliNumber(summary.totalRecords)} টি
            </div>
          </div>

          <div className="p-3 bg-white print:bg-white rounded-lg border border-slate-200 shadow-2xs print:border-slate-400">
            <div className="text-[11px] font-semibold text-slate-500 print:text-slate-800">মোট আয় / জমা</div>
            <div className="text-xl font-black text-emerald-600 print:text-black mt-1">
              {formatCurrency(summary.totalIncome)}
            </div>
          </div>

          <div className="p-3 bg-white print:bg-white rounded-lg border border-slate-200 shadow-2xs print:border-slate-400">
            <div className="text-[11px] font-semibold text-slate-500 print:text-slate-800">মোট ব্যয় / খরচ</div>
            <div className="text-xl font-black text-rose-600 print:text-black mt-1">
              {formatCurrency(summary.totalExpense)}
            </div>
          </div>

          <div className="p-3 bg-white print:bg-white rounded-lg border border-slate-200 shadow-2xs print:border-slate-400">
            <div className="text-[11px] font-semibold text-slate-500 print:text-slate-800">নিট ব্যালেন্স / ক্যাশ</div>
            <div className={`text-xl font-black mt-1 ${
              summary.netBalance >= 0 ? 'text-emerald-700 print:text-black' : 'text-rose-700 print:text-black'
            }`}>
              {formatCurrency(summary.netBalance)}
            </div>
          </div>
        </div>

        {/* Category Breakdown (Printable & Screen) */}
        {Object.keys(summary.catBreakdown).length > 0 && (
          <div className="p-4 bg-slate-50/60 print:bg-white rounded-xl border border-slate-200 print:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-slate-500 print:hidden" />
              <span>ক্যাটাগরিভিত্তিক আয় ও ব্যয় সারসংক্ষেপ (Category Summary)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {Object.entries(summary.catBreakdown).map(([catName, amounts]) => (
                <div key={catName} className="p-2 bg-white rounded-lg border border-slate-200/80 print:border-slate-300">
                  <div className="font-semibold text-slate-800 truncate" title={catName}>
                    {catName}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    {amounts.income > 0 && (
                      <span className="text-emerald-600 font-bold">
                        আয়: {formatCurrency(amounts.income)}
                      </span>
                    )}
                    {amounts.expense > 0 && (
                      <span className="text-rose-600 font-bold">
                        ব্যয়: {formatCurrency(amounts.expense)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Transactions Breakdown for the Selected Month */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              বিস্তারিত আইটেমাইজড লেনদেনের খাতা (Detailed Itemized Ledger)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono print:hidden">
              মুদ্রণ কপি প্রস্তুত
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-xl print:border-slate-800 print:rounded-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-200 text-slate-800 font-bold border-b border-slate-300 print:border-slate-800">
                  <th className="py-2.5 px-3 border-r border-slate-200 print:border-slate-400">ক্রমিক</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 print:border-slate-400">তারিখ</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 print:border-slate-400">ধরন</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 print:border-slate-400">কাজের বিবরণ / খাত</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 print:border-slate-400">ক্যাটাগরি</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-200 print:border-slate-400">টাকার পরিমাণ</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 print:border-slate-400">পেমেন্ট</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 print:border-slate-400">এন্ট্রিদাতা</th>
                  <th className="py-2.5 px-3">মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-slate-400">
                {monthTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      এই নির্বাচিত মাসে কোনো লেনদেন রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  monthTransactions.map((tx, idx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 print:hover:bg-white page-break-avoid">
                        <td className="py-2 px-3 text-slate-500 font-medium border-r border-slate-200 print:border-slate-300 text-center">
                          {toBengaliNumber(idx + 1)}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-800 font-semibold border-r border-slate-200 print:border-slate-300">
                          {tx.date}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap border-r border-slate-200 print:border-slate-300">
                          <span className={`font-bold ${isIncome ? 'text-emerald-700 print:text-black' : 'text-rose-700 print:text-black'}`}>
                            {isIncome ? 'আয় (Income)' : 'ব্যয় (Expense)'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-900 font-medium border-r border-slate-200 print:border-slate-300">
                          {tx.title}
                        </td>
                        <td className="py-2 px-3 text-slate-700 whitespace-nowrap border-r border-slate-200 print:border-slate-300">
                          {tx.category}
                        </td>
                        <td className={`py-2 px-3 text-right font-bold whitespace-nowrap border-r border-slate-200 print:border-slate-300 ${
                          isIncome ? 'text-emerald-600 print:text-black' : 'text-rose-600 print:text-black'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="py-2 px-3 text-slate-700 whitespace-nowrap border-r border-slate-200 print:border-slate-300">
                          {tx.paymentMethod === 'bkash' ? 'বিকাশ' : tx.paymentMethod === 'nagad' ? 'নগদ' : tx.paymentMethod === 'bank' ? 'ব্যাংক' : 'নগদ (Cash)'}
                        </td>
                        <td className="py-2 px-3 text-slate-700 whitespace-nowrap border-r border-slate-200 print:border-slate-300">
                          {tx.addedBy}
                        </td>
                        <td className="py-2 px-3 text-slate-600 italic">
                          {tx.note || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {/* Table Footer with Totals */}
              <tfoot>
                <tr className="bg-slate-100 print:bg-slate-200 font-extrabold text-slate-900 border-t-2 border-slate-400">
                  <td colSpan={5} className="py-2.5 px-3 text-right border-r border-slate-300">
                    সর্বমোট হিসাব (Net Total):
                  </td>
                  <td className="py-2.5 px-3 text-right border-r border-slate-300">
                    <div className="text-emerald-700 print:text-black text-xs font-bold">
                      আয়: +{formatCurrency(summary.totalIncome)}
                    </div>
                    <div className="text-rose-700 print:text-black text-xs font-bold">
                      ব্যয়: -{formatCurrency(summary.totalExpense)}
                    </div>
                    <div className="text-slate-900 font-black text-sm border-t border-slate-300 pt-0.5 mt-0.5">
                      নিট: {formatCurrency(summary.netBalance)}
                    </div>
                  </td>
                  <td colSpan={3} className="py-2.5 px-3 text-slate-500 italic text-[11px]">
                    স্বয়ংক্রিয় ক্লাউড হিসাব থেকে গণনাকৃত
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION A: অংশীদারদের অনুমোদন ও স্বাক্ষর (Share Partners' Signatures) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="pt-4 page-break-avoid border-t-2 border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              <Users className="w-4 h-4 text-emerald-700 print:text-black" />
              <span>অংশীদারগণের অনুমোদন ও লাভ-লোকসান সম্মতি স্বাক্ষর (Share Partners' Signatures)</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              অনুপাত ভিত্তিতে লাভ-লোকসান বণ্টন গৃহীত ও স্বাক্ষরিত
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {effectivePartners.map((partner, pIdx) => {
              const partnerShare = (summary.netBalance * (partner.sharePercentage || 0)) / 100;
              return (
                <div
                  key={partner.id || pIdx}
                  className="bg-slate-50/70 print:bg-white border border-slate-300 print:border-slate-400 rounded-xl p-3 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs truncate" title={partner.name}>
                        {partner.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 print:bg-slate-100 text-emerald-800 print:text-black rounded">
                        {toBengaliNumber(partner.sharePercentage)}% অংশ
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {partner.role || 'অংশীদার'} {partner.phone ? `• ${partner.phone}` : ''}
                    </div>

                    {signatories.showPartnerShares && (
                      <div className="mt-2 pt-2 border-t border-slate-200 print:border-slate-300 text-[10px] space-y-0.5">
                        <div className="flex justify-between text-slate-600">
                          <span>বিনিয়োগ মূলধন:</span>
                          <span className="font-semibold text-slate-800">{formatCurrency(partner.investment || 0)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>চলতি মাসের অংশ:</span>
                          <span className={partnerShare >= 0 ? 'text-emerald-700 print:text-black' : 'text-rose-700 print:text-black'}>
                            {formatCurrency(partnerShare)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Physical Signature Line */}
                  <div className="pt-6 text-center">
                    <div className="w-full border-b border-dashed border-slate-600 print:border-slate-800 mb-1"></div>
                    <div className="text-[10px] font-bold text-slate-800">অংশীদারের স্বাক্ষর ও তারিখ</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION B: পরিচালক, অডিটর ও ম্যানেজারের অফিসিয়াল স্বাক্ষর ও অনুমোদন */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="pt-6 page-break-avoid border-t border-slate-300 space-y-4">
          {/* Audit Declaration Note */}
          <div className="bg-slate-50 print:bg-slate-100/60 border border-slate-200 print:border-slate-400 rounded-xl p-2.5 text-[11px] text-slate-700 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 print:text-black shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">অভ্যন্তরীণ অডিট ও নিরপত্তা পর্যবেক্ষণ: </span>
              <span>{signatories.auditorRemarks}</span>
            </div>
          </div>

          {/* 3-Column Signatory Grid: Manager, Auditor, Director */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-xs text-slate-700">
            {/* 1. ম্যানেজার (Manager) */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-transparent print:border-slate-300">
              <div className="h-10 flex items-end justify-center w-full">
                <span className="text-[11px] text-slate-400 italic print:hidden">স্বাক্ষর করুন</span>
              </div>
              <div className="w-44 border-b-2 border-slate-800 mb-1.5"></div>
              <div className="font-extrabold text-slate-900 text-sm">{signatories.managerName}</div>
              <div className="text-slate-700 font-semibold text-xs">{signatories.managerTitle}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{companyName}</div>
              <div className="text-[10px] text-slate-500 mt-1">
                তারিখ: <span className="font-mono">................................</span>
              </div>
            </div>

            {/* 2. অডিট কর্মকর্তা (Auditor) */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-transparent print:border-slate-300 bg-slate-50/50 print:bg-transparent">
              <div className="h-10 flex items-end justify-center w-full">
                <span className="text-[10px] font-bold text-amber-800 print:text-black bg-amber-100 print:bg-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-amber-600 print:text-black" />
                  ভাউচার ও খাতা নিরীক্ষিত
                </span>
              </div>
              <div className="w-44 border-b-2 border-slate-800 mb-1.5"></div>
              <div className="font-extrabold text-slate-900 text-sm">{signatories.auditorName}</div>
              <div className="text-slate-700 font-semibold text-xs">{signatories.auditorTitle}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">নিরীক্ষা ও হিসাব বিভাগ</div>
              <div className="text-[10px] text-slate-500 mt-1">
                তারিখ: <span className="font-mono">................................</span>
              </div>
            </div>

            {/* 3. পরিচালক (Director) */}
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-transparent print:border-slate-300 relative">
              {/* Optional Official Seal Stamp Graphic */}
              {signatories.showSealStamp && (
                <div className="absolute -top-6 right-2 sm:right-4 w-16 h-16 rounded-full border-2 border-dashed border-emerald-700/60 print:border-black/70 flex flex-col items-center justify-center text-[8px] text-emerald-800 print:text-black font-extrabold pointer-events-none rotate-[-8deg] opacity-80 select-none">
                  <span>DIP BHOLA</span>
                  <span className="text-[7px]">★ SEAL ★</span>
                  <span>অনুমোদিত</span>
                </div>
              )}

              <div className="h-10 flex items-end justify-center w-full">
                <span className="text-[11px] text-slate-400 italic print:hidden">অনুমোদন স্বাক্ষর</span>
              </div>
              <div className="w-44 border-b-2 border-slate-800 mb-1.5"></div>
              <div className="font-extrabold text-slate-900 text-sm">{signatories.directorName}</div>
              <div className="text-slate-700 font-semibold text-xs">{signatories.directorTitle}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{companyName}</div>
              <div className="text-[10px] text-slate-500 mt-1">
                তারিখ: <span className="font-mono">................................</span>
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer Note */}
        <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-200 print:border-slate-400">
          * এটি DIP BHOLA NETWORK এর অফিসিয়াল ক্লাউড হিসাব খাতা থেকে সংগৃহীত। অডিট কর্মকর্তা, শাখা ম্যানেজার, প্রধান পরিচালক এবং সকল শেয়ার অংশীদারদের উপস্থিতিতে যাচাই ও অনুমোদিত।
        </div>
      </div>

      {/* Global CSS for Clean Printing */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 10pt !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
};
