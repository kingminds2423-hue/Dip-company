import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Users,
  UserPlus,
  Coins,
  PieChart,
  Monitor,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  QrCode,
  Download,
  Database,
  Building2,
  LogOut,
  X,
  Sparkles,
  Zap,
  Smartphone,
  UserCheck
} from 'lucide-react';
import { UserSession } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserSession;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onOpenStaffQr: () => void;
  onOpenMonthlyPdf: () => void;
  onOpenBackup: () => void;
  onOpenCompanySetup: () => void;
  onOpenAddStaff: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  stats?: {
    txCount: number;
    staffCount: number;
    duesCount: number;
    netBalance: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isFullScreen,
  onToggleFullScreen,
  onOpenStaffQr,
  onOpenMonthlyPdf,
  onOpenBackup,
  onOpenCompanySetup,
  onOpenAddStaff,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  stats
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();

  // Navigation modules with smart color themes
  const navBars = [
    {
      id: 'dashboard',
      label: 'দৈনিক হিসাব ড্যাশবোর্ড',
      icon: LayoutDashboard,
      badge: 'লাইভ',
      badgeColor: 'bg-emerald-500 text-slate-950',
      activeGradient: 'from-emerald-700 via-emerald-600 to-teal-700 border-emerald-400 shadow-emerald-900/50',
      iconColor: 'text-emerald-400'
    },
    {
      id: 'transactions',
      label: 'দৈনিক আয়-ব্যয় খাতা',
      icon: Receipt,
      badge: stats?.txCount !== undefined ? `${stats.txCount}টি` : undefined,
      badgeColor: 'bg-cyan-500 text-slate-950',
      activeGradient: 'from-teal-700 via-cyan-700 to-blue-800 border-cyan-400 shadow-cyan-950/50',
      iconColor: 'text-cyan-400'
    },
    {
      id: 'staff',
      label: 'স্টাফ তালিকা ও সিভি',
      icon: Users,
      badge: stats?.staffCount !== undefined ? `${stats.staffCount}জন` : undefined,
      badgeColor: 'bg-indigo-400 text-slate-950',
      activeGradient: 'from-blue-700 via-indigo-700 to-violet-800 border-indigo-400 shadow-indigo-950/50',
      iconColor: 'text-indigo-400'
    },
    {
      id: 'quick_add_staff',
      label: 'নতুন স্টাফ নিয়োগ',
      icon: UserPlus,
      isAction: true,
      action: onOpenAddStaff,
      badge: '+ ফরম',
      badgeColor: 'bg-emerald-400 text-emerald-950 font-black',
      iconColor: 'text-emerald-300'
    },
    {
      id: 'dues',
      label: 'বাকি খাতা (লেজার)',
      icon: Coins,
      badge: stats?.duesCount !== undefined && stats.duesCount > 0 ? `${stats.duesCount} বাকি` : undefined,
      badgeColor: 'bg-amber-400 text-amber-950 font-bold',
      activeGradient: 'from-amber-700 via-orange-700 to-red-800 border-amber-400 shadow-amber-950/50',
      iconColor: 'text-amber-400'
    },
    {
      id: 'partners',
      label: 'অংশীদার ও মূলধন (Partners)',
      icon: PieChart,
      activeGradient: 'from-purple-700 via-fuchsia-700 to-pink-800 border-purple-400 shadow-purple-950/50',
      iconColor: 'text-purple-400'
    },
    {
      id: 'officers',
      label: 'ম্যানেজার ও অডিটর নিয়োগ',
      icon: UserCheck,
      badge: 'কর্মকর্তা',
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
      activeGradient: 'from-amber-800 via-yellow-700 to-amber-900 border-amber-400 shadow-amber-950/50',
      iconColor: 'text-amber-300'
    },
    {
      id: 'display',
      label: 'ডিজিটাল ডিসপ্লে বোর্ড',
      icon: Monitor,
      badge: 'LED',
      badgeColor: 'bg-lime-400 text-slate-950 animate-pulse font-mono',
      activeGradient: 'from-teal-800 via-emerald-800 to-green-900 border-lime-400 shadow-emerald-950/50',
      iconColor: 'text-lime-400'
    },
    {
      id: 'reports',
      label: 'আর্থিক সারসংক্ষেপ ও রিপোর্ট',
      icon: FileSpreadsheet,
      activeGradient: 'from-blue-800 via-sky-700 to-teal-800 border-sky-400 shadow-sky-950/50',
      iconColor: 'text-sky-400'
    }
  ];

  const handleNavClick = (item: typeof navBars[0]) => {
    if (item.isAction && item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const userInitial = currentUser.name ? currentUser.name.trim().charAt(0) : 'জ';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#03291d] text-emerald-50 select-none shadow-2xl">
      
      {/* Top Brand / Panel Header with colorful smart badge */}
      <div className="p-3.5 border-b border-emerald-900/90 flex items-center justify-between bg-gradient-to-r from-[#03291d] via-[#053d2c] to-[#03291d]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white border border-emerald-500/40 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img
              src="/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black tracking-wide text-white truncate uppercase">
                DIP BHOLA NETWORK
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-2xs">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              স্মার্ট নেটওয়ার্ক কন্ট্রোল
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
          title="মেন্যু বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Container with Separate Individual Colorful Bars */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">
        
        {/* SECTION 1: কুইক অ্যাকশন বারসমূহ (Quick Action Bars) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-extrabold text-emerald-300/90 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              কুইক অ্যাকশন বার
            </span>
            <span className="text-[10px] text-emerald-400/70 font-mono">5 Tools</span>
          </div>
          
          <div className="space-y-1.5">
            {/* Install WebAPK button when running in browser mode */}
            {!isInstalled && (
              <button
                onClick={async () => {
                  if (isInstallable) {
                    await install();
                  } else {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch(() => {});
                    }
                  }
                  if (isOpenMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-md border border-emerald-300"
                title="ব্রাউজার বার ছাড়া ফুলস্ক্রিন আসল অ্যাপ হিসেবে ইনস্টল করুন"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-950/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-3.5 h-3.5 text-slate-950" />
                </div>
                <span className="truncate">ফুল অ্যাপ হিসেবে ইনস্টল</span>
                <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-950 text-emerald-300">
                  WebAPK
                </span>
              </button>
            )}

            {/* Bar 1: ফুল স্ক্রিন (টপবার লুকান / দেখান) with glowing neon pill bar */}
            <button
              onClick={onToggleFullScreen}
              className="w-full relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-[#063828] to-[#084733] hover:from-[#094d38] hover:to-[#0a5740] text-emerald-50 border border-emerald-700/70 shadow-xs group"
              title="টপবার লুকিয়ে ফুলস্ক্রিন ভিউ করুন"
            >
              {/* Glowing vertical pill indicator on left edge */}
              <span className={`w-1.5 h-5 rounded-full transition-all shrink-0 ${
                isFullScreen
                  ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]'
                  : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
              }`} />
              
              {isFullScreen ? (
                <Maximize2 className="w-4 h-4 text-amber-300 shrink-0" />
              ) : (
                <Minimize2 className="w-4 h-4 text-emerald-300 shrink-0" />
              )}
              <span className="truncate">
                {isFullScreen ? 'ফুল স্ক্রিন (টপবার দেখান)' : 'ফুল স্ক্রিন (টপবার লুকান)'}
              </span>
            </button>

            {/* Bar 2: স্টাফ QR কোড */}
            <button
              onClick={() => {
                onOpenStaffQr();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-teal-950 to-emerald-950 hover:from-teal-900 hover:to-emerald-900 text-teal-100 border border-teal-700/60 shadow-xs hover:border-teal-400"
            >
              <div className="w-6 h-6 rounded-lg bg-teal-800/80 flex items-center justify-center shrink-0 border border-teal-500/50">
                <QrCode className="w-3.5 h-3.5 text-teal-200" />
              </div>
              <span className="truncate">স্টাফ QR কোড</span>
              <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-teal-800/80 text-teal-200 border border-teal-600/50">
                ID কার্ড
              </span>
            </button>

            {/* Bar 3: মাসিক PDF (Vibrant Orange / Amber Gradient Bar) */}
            <button
              onClick={() => {
                onOpenMonthlyPdf();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-950/40 border border-amber-300/80 hover:scale-[1.01]"
            >
              <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
                <Download className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="truncate">মাসিক PDF</span>
              <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/25 text-white">
                প্রিন্ট
              </span>
            </button>

            {/* Bar 4: ব্যাকআপ ও ড্রাইভ */}
            <button
              onClick={() => {
                onOpenBackup();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-indigo-950 to-emerald-950 hover:from-indigo-900 hover:to-emerald-900 text-indigo-100 border border-indigo-700/60 shadow-xs hover:border-indigo-400"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-800/80 flex items-center justify-center shrink-0 border border-indigo-500/50">
                <Database className="w-3.5 h-3.5 text-indigo-200" />
              </div>
              <span className="truncate">ব্যাকআপ ও ড্রাইভ</span>
              <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-900 text-indigo-200 border border-indigo-700">
                ক্লাউড
              </span>
            </button>

            {/* Bar 5: কোম্পানি সেটআপ */}
            <button
              onClick={() => {
                onOpenCompanySetup();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 text-emerald-100 border border-emerald-700/60 shadow-xs hover:border-emerald-400"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-800/80 flex items-center justify-center shrink-0 border border-emerald-500/50">
                <Building2 className="w-3.5 h-3.5 text-emerald-200" />
              </div>
              <span className="truncate">কোম্পানি সেটআপ</span>
            </button>

          </div>
        </div>

        {/* SECTION 2: প্রধান হিসাব ও রেজিস্টার বার (Navigation Bars - "আলাদা আলাদা বার") */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-extrabold text-emerald-300/90 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              প্রধান হিসাব ও রেজিস্টার বার
            </span>
          </div>

          <div className="space-y-1.5">
            {navBars.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.isAction) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-emerald-900/60 to-teal-900/60 hover:from-emerald-800 hover:to-teal-800 text-emerald-100 border border-emerald-600/60 hover:border-emerald-400 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-emerald-800 flex items-center justify-center shrink-0 border border-emerald-500/50">
                        <Icon className="w-3.5 h-3.5 text-emerald-300" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-emerald-700 text-emerald-100'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${item.activeGradient || 'from-emerald-700 to-teal-700'} text-white shadow-lg border-2 border-emerald-300 ring-2 ring-emerald-500/20`
                      : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-100 border border-emerald-900/80 hover:border-emerald-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-900/80 ' + (item.iconColor || 'text-emerald-300')
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-slate-950 shadow-xs' : item.badgeColor || 'bg-emerald-600 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECTION 3 (Bottom): ইউজার প্রোফাইল ও লগআউট বার */}
      <div className="p-3 border-t border-emerald-900/90 bg-[#022117] space-y-2 shrink-0">
        
        {/* User Profile Card (As seen in user screenshot) */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-emerald-950 to-[#043324] border border-emerald-700/70 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-xs shrink-0 border border-emerald-300 shadow-2xs">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate leading-tight flex items-center gap-1">
              <span>{currentUser.name}</span>
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold truncate leading-tight flex items-center gap-1">
              <span>{currentUser.role === 'admin' ? 'পরিচালক / এডমিন' : currentUser.designation}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
          </div>
        </div>

        {/* Logout / Switch Bar (Reddish / Coral tint as seen in screenshot) */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-rose-950/80 to-red-950/80 hover:from-rose-900 hover:to-red-900 text-rose-200 border border-rose-800/80 shadow-xs hover:border-rose-600"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-300" />
          <span>লগআউট / বদলান</span>
        </button>

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex w-72 lg:w-76 xl:w-80 shrink-0 h-screen sticky top-0 border-r border-emerald-950 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <div className="relative w-76 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
