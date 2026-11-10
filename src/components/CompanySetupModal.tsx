import React, { useState, useEffect } from 'react';
import { X, Building2, Phone, Mail, MapPin, Image, Check, RefreshCw } from 'lucide-react';
import { Company, UserSession } from '../types';

interface CompanySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onSaveCompany: (company: Company) => Promise<void>;
  currentUser: UserSession;
}

export const CompanySetupModal: React.FC<CompanySetupModalProps> = ({
  isOpen,
  onClose,
  company,
  onSaveCompany,
  currentUser
}) => {
  const [name, setName] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (company) {
      setName(company.name || 'DIP BHOLA NETWORK');
      setSubTitle(company.subTitle || 'দৈনিক আয়-ব্যয় ও কেন্দ্রীয় স্টাফ মনিটরিং সিস্টেম');
      setOwnerName(company.ownerName || 'জাহিদুল ইসলাম');
      setPhone(company.phone || '01721200049');
      setEmail(company.email || 'zahidulislam53330@gmail.com');
      setAddress(company.address || '৩নং পশ্চিম ইলিশা।ভোলা সদর ভোলা');
      setLogoUrl(company.logoUrl || '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg');
    }
  }, [company, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const updatedCompany: Company = {
        name: name.trim(),
        subTitle: subTitle.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        logoUrl: logoUrl.trim() || '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg',
        currencySymbol: company?.currencySymbol || '৳',
        partners: company?.partners || []
      };
      await onSaveCompany(updatedCompany);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to update company:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#064e3b] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center justify-center text-emerald-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">কোম্পানি সেটআপ ও তথ্য</h2>
              <p className="text-xs text-emerald-200">টপবার ও অফিসিয়াল ডকুমেন্টের তথ্য পরিবর্তন করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              কোম্পানি তথ্য সফলভাবে ফায়ারবেসে সংরক্ষিত হয়েছে!
            </div>
          )}

          {/* Logo Preview and Path */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 p-1">
              <img
                src={logoUrl || '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg'}
                alt="Logo Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold text-slate-700 mb-1">লোগো ইমেজ লিঙ্ক বা পাথ</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">ডিফল্ট লোগো: FB_IMG_1793200670972.jpg</p>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              প্রতিষ্ঠানের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="DIP BHOLA NETWORK"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold text-slate-900"
            />
          </div>

          {/* Subtitle / Slogan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              স্লোগান / সাবটাইটেল
            </label>
            <input
              type="text"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder="দৈনিক আয়-ব্যয় ও কেন্দ্রীয় স্টাফ মনিটরিং সিস্টেম"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Owner & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পরিচালকের নাম
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="জাহিদুল ইসলাম"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                মোবাইল নম্বর
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01721200049"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ইমেইল অ্যাড্রেস
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="zahidulislam53330@gmail.com"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              অফিস ঠিকানা
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="৩নং পশ্চিম ইলিশা।ভোলা সদর ভোলা"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
