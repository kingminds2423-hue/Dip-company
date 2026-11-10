import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Maximize, ExternalLink } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Toggle fullscreen mode immediately to hide browser address bar
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  // If already running in standalone mode (installed WebAPK/PWA without browser bars)
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>অ্যাপ মোড সক্রিয়</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-xs transition-all transform hover:scale-[1.02] active:scale-95"
          title="মোবাইলে আসল ফুল অ্যাপ হিসেবে ইনস্টল করুন"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>অ্যাপ ইনস্টল করুন</span>
        </button>

        <button
          onClick={handleToggleFullscreen}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition"
          title="ফুলস্ক্রিন মোড (ব্রাউজার বার লুকান)"
        >
          <Maximize className="w-3.5 h-3.5" />
          <span className="hidden md:inline">ফুলস্ক্রিন</span>
        </button>
      </div>

      {/* Guide Modal when beforeinstallprompt is not directly available */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
                <Smartphone className="w-5 h-5" />
                <span>ফুল অ্যাপ (WebAPK) ইনস্টল করার নিয়ম</span>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-medium text-xs leading-relaxed">
                💡 <strong>কেন ইনস্টল করবেন?</strong> ইনস্টল করলে মোবাইলের ওপরের ব্রাউজার অ্যাড্রেস বার (<code className="bg-emerald-100 px-1 rounded">...run.app</code>) এবং ক্লোজ (<code className="bg-emerald-100 px-1 rounded">X</code>) বাটন স্থায়ীভাবে চলে যাবে এবং এটি প্লে স্টোরের অ্যাপের মতো ফুলস্ক্রিন চলবে।
              </div>

              {isIOS ? (
                <div className="space-y-2 text-slate-700">
                  <p className="font-semibold text-slate-900">আইফোন (iOS) এ ইনস্টল করতে:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 pl-1">
                    <li>Safari ব্রাউজারের নিচের <strong>Share</strong> বাটনে চাপ দিন।</li>
                    <li>মেন্যু থেকে <strong>'Add to Home Screen'</strong> এ চাপ দিন।</li>
                    <li>উপরে <strong>'Add'</strong> চাপলেই আপনার হোমস্ক্রিনে অ্যাপটি যোগ হয়ে যাবে।</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2 text-slate-700">
                  <p className="font-semibold text-slate-900">অ্যান্ড্রয়েড (Chrome) এ ইনস্টল করতে:</p>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 pl-1">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold">১.</span>
                      <span>ব্রাউজারের উপরে ডানদিকের <strong>৩-ডট (⋮) মেন্যু</strong> তে চাপ দিন।</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold">২.</span>
                      <span>মেন্যু থেকে <strong>'Install app'</strong> অথবা <strong>'Add to Home screen'</strong> এ চাপ দিন।</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold">৩.</span>
                      <span>কনফার্ম করতে <strong>'Install'</strong> এ ট্যাপ করুন।</span>
                    </li>
                  </ol>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={handleToggleFullscreen}
                  className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition"
                >
                  আপাতত ফুলস্ক্রিন করুন
                </button>
                <button
                  onClick={() => setShowGuide(false)}
                  className="flex-1 py-2 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs"
                >
                  ঠিক আছে
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
