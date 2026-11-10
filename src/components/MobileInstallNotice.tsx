import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Maximize, X } from 'lucide-react';

export const MobileInstallNotice: React.FC = () => {
  const { isInstalled, isInstallable, isAndroid, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // If already running as standalone app or user dismissed for this session
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white px-3 py-2 text-xs border-b border-emerald-700/60 shadow-xs flex items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/30 flex items-center justify-center shrink-0 border border-emerald-400/40">
            <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
          </div>
          <div className="truncate">
            <span className="font-bold text-emerald-200">ফুল অ্যাপ মোড: </span>
            <span className="text-slate-200 text-[11px]">
              ব্রাউজার বার ও '...run.app' ছাড়া আসল অ্যাপের মতো চালান
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="px-2.5 py-1 text-[11px] font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-xs transition"
          >
            অ্যাপ ইনস্টল
          </button>
          <button
            onClick={handleFullscreen}
            className="hidden sm:inline-flex px-2 py-1 text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            title="ফুলস্ক্রিন মোড"
          >
            <Maximize className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white transition"
            title="বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Guide Dialog if browser hasn't prompted yet */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-800 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h3 className="font-bold text-sm text-emerald-800 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                ফুল অ্যাপ হিসেবে ইনস্টল করুন
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2.5 text-slate-700">
              <p className="bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 leading-relaxed">
                ইনস্টল করলে মোবাইলের ওপরের <strong>ওয়েবসাইট লিঙ্ক (...run.app)</strong> ও <strong>[X] বাটন</strong> আর দেখাবে না। এটি আপনার ফোনে প্লে-স্টোরের অ্যাপের মতো ফুলস্ক্রিন চলবে।
              </p>

              <div className="space-y-1.5">
                <p className="font-bold text-slate-900">ইনস্টল করার সহজ নিয়ম:</p>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700">১.</span>
                  <span>ব্রাউজারের উপরের ডানদিকের <strong>৩-ডট (⋮)</strong> মেন্যুতে চাপুন।</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700">২.</span>
                  <span>মেন্যু থেকে <strong>'Install app'</strong> বা <strong>'Add to Home screen'</strong> চাপুন।</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700">৩.</span>
                  <span>কনফার্ম করলেই ফোনের হোমস্ক্রিনে অ্যাপ আইকন তৈরি হয়ে যাবে!</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex gap-2">
              <button
                onClick={handleFullscreen}
                className="flex-1 py-1.5 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl"
              >
                আপাতত ফুলস্ক্রিন
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-1.5 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
