import React from 'react';
import { Company, UserSession } from '../types';
import { Minimize2, Maximize2, Menu } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  company: Company | null;
  onToggleSidebar?: () => void;
  onToggleFullScreen?: () => void;
  isFullScreen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  onToggleSidebar,
  onToggleFullScreen,
  isFullScreen = false
}) => {
  const companyName = company?.name || 'DIP BHOLA NETWORK';
  const subTitle = company?.subTitle || 'দৈনিক আয়-ব্যয় ও কেন্দ্রীয় স্টাফ মনিটরিং সিস্টেম';
  const ownerName = company?.ownerName || 'জাহিদুল ইসলাম';
  const phone = company?.phone || '01721200049';
  const email = company?.email || 'zahidulislam53330@gmail.com';
  const address = company?.address || '৩নং পশ্চিম ইলিশা।ভোলা সদর ভোলা';
  const logoUrl = company?.logoUrl || '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg';

  return (
    <header className="bg-white border-b border-slate-200/90 shadow-xs relative transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left Side: Logo Card */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile menu trigger */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                title="বাম পাশের মেন্যু বার খুলুন"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center overflow-hidden p-2 shrink-0 transition-transform hover:scale-105">
              <img
                src={logoUrl}
                alt={companyName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg';
                }}
              />
            </div>
          </div>

          {/* Center: Main Branding Block (Exact match to requested top bar) */}
          <div className="flex-1 text-center min-w-0 px-2 sm:px-4">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {companyName}
            </h1>

            {/* Subtitle in Forest/Emerald Green */}
            <p className="text-emerald-800 text-xs sm:text-sm md:text-base font-bold mt-1">
              {subTitle}
            </p>

            {/* Contact Info Line */}
            <div className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-800 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 gap-y-0.5 mt-1.5">
              <span>
                <span className="text-slate-600 font-normal">পরিচালক:</span>{' '}
                <strong className="text-slate-900">{ownerName}</strong>
              </span>
              <span>
                <span className="text-slate-600 font-normal">মোবাইল:</span>{' '}
                <strong className="text-slate-900">{phone}</strong>
              </span>
              <span className="hidden md:inline">
                <span className="text-slate-600 font-normal">ইমেইল:</span>{' '}
                <strong className="text-slate-900 font-mono text-xs">{email}</strong>
              </span>
            </div>

            {/* Address Line (Centered below) */}
            <div className="text-[11px] sm:text-xs font-semibold text-slate-700 text-center mt-0.5">
              ঠিকানা: {address}
            </div>
          </div>

          {/* Right Side: Install App & Fullscreen Toggle */}
          <div className="shrink-0 flex items-center gap-2">
            <PWAInstallButton />

            {onToggleFullScreen && (
              <button
                onClick={onToggleFullScreen}
                title={isFullScreen ? 'টপবার দেখান' : 'ফুল স্ক্রিন (টপবার লুকান)'}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all shadow-2xs"
              >
                {isFullScreen ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>প্রসারিত</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">টপবার লুকান</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
