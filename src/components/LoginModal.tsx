import React, { useState } from 'react';
import {
  X,
  Key,
  Mail,
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Staff, AdminAuth, UserSession } from '../types';
import { authenticateWithPin, authenticateWithEmailPassword } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffs: Staff[];
  adminAuth: AdminAuth | null;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  staffs,
  adminAuth,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'pin' | 'email'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('zahidulislam53330@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const session = authenticateWithPin(pin, adminAuth, staffs);
    if (session) {
      onLoginSuccess(session);
      onClose();
    } else {
      setError('ভুল পিন কোড! অ্যাডমিন পিন "১২৩৪" অথবা আপনার স্টাফ পিন দিন।');
    }
  };

  const handleQuickPresetLogin = (presetPin: string) => {
    setPin(presetPin);
    const session = authenticateWithPin(presetPin, adminAuth, staffs);
    if (session) {
      onLoginSuccess(session);
      onClose();
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('ইমেইল ও পাসওয়ার্ড উভয়ই পূরণ করুন।');
      return;
    }

    try {
      setLoading(true);
      const session = await authenticateWithEmailPassword(email.trim(), password);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'লগইন ব্যর্থ হয়েছে। ক্রেডেনশিয়াল সঠিক কি না যাচাই করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">ব্যবহারকারী লগইন ও ভেরিফিকেশন</h3>
              <p className="text-xs text-slate-400">DIP BHOLA NETWORK সিকিউরিটি</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('pin'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'pin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              পিন দিয়ে দ্রুত প্রবেশ
            </button>
            <button
              type="button"
              onClick={() => { setMode('email'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'email'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              ফায়ারবেস ইমেইল লগইন
            </button>
          </div>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'pin' ? (
            <div className="space-y-4">
              <form onSubmit={handlePinSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    আপনার ৪-ডিজিট পিন কোড দিন *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center tracking-widest text-2xl font-mono py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
                >
                  <UserCheck className="w-4 h-4" />
                  প্রবেশ নিশ্চিত করুন
                </button>
              </form>

              {/* Quick Preset Buttons for Instant Testing */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  তাত্ক্ষণিক নির্বাচন (১-ক্লিক লগইন):
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPresetLogin(adminAuth?.pin || '1234')}
                    className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-amber-100 text-amber-800">👑</span>
                      <div>
                        <div className="font-bold text-slate-900">জাহিদুল ইসলাম (পরিচালক)</div>
                        <div className="text-[10px] text-slate-500">প্রধান অ্যাডমিন • পিন: {adminAuth?.pin || '1234'}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {staffs.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleQuickPresetLogin(st.pin)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 text-left flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-teal-100 text-teal-800">🔧</span>
                        <div>
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <div className="text-[10px] text-slate-500">{st.designation} • পিন: {st.pin}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইমেইল অ্যাড্রেস *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পাসওয়ার্ড *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন (FirebaseAuth)'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
