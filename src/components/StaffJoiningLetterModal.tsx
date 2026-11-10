import React from 'react';
import { X, Printer, Phone, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Staff, Company } from '../types';
import { formatCurrency, formatBengaliDate, toBengaliNumber } from '../utils/formatters';

interface StaffJoiningLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  company: Company | null;
}

export const StaffJoiningLetterModal: React.FC<StaffJoiningLetterModalProps> = ({
  isOpen,
  onClose,
  staff,
  company
}) => {
  if (!isOpen || !staff) return null;

  const companyName = company?.name || 'DIP BHOLA NETWORK';
  const ownerName = company?.ownerName || 'জাহিদুল ইসলাম';
  const companyPhone = company?.phone || '01721200049';

  const handlePrint = () => {
    window.print();
  };

  // Default values matching the user's template
  const fatherName = staff.fatherName || 'আক্তার হোসেন';
  const motherName = staff.motherName || 'হাসনা বেগম';
  const nid = staff.nid || '২০০৯০৯১১৮৫৫১৩৮৪৪৩';
  const bloodGroup = staff.bloodGroup || 'O-';
  const address = staff.address || 'জাংগালিয়া মিঝি বাড়ি। ৩নং পশ্চিম ইলিশা ভোলা সদর ভোলা';
  const permanentAddress = staff.permanentAddress || address;
  const education = staff.education || 'HSC';
  const emergencyContact = staff.emergencyContact || staff.phone || '+880 1321-454984';
  const designation = staff.designation || 'সহকারী টেকনিশিয়ান';
  const salary = staff.salary || 8000;
  const joinedDate = staff.joinedAt || '2026-10-01';
  const pin = staff.pin || '4984';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="bg-[#043324] px-6 py-3.5 flex items-center justify-between text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base">স্টাফ অফিসিয়াল নিয়োগপত্র ও সিভি (প্রিন্ট কপি)</span>
            <span className="text-xs bg-emerald-700/80 px-2 py-0.5 rounded-full text-emerald-200 font-medium">ছবি সহ প্রিন্ট কপি</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট করুন (PDF)
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body (Exact replica of user screenshot) */}
        <div className="p-6 sm:p-10 bg-white text-slate-800 font-sans print:p-6 print:m-0" id="printable-joining-letter">
          
          {/* Header Section with Staff Name, Info, and Passport Photo */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-4">
            
            {/* Left Info Column */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black tracking-wider text-emerald-800 uppercase mb-1">
                {companyName} | নিয়োগকৃত কর্মকর্তা/স্টাফ
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                {staff.name}
              </h1>

              {/* Designation Badge */}
              <div className="mt-2.5">
                <span className="inline-block px-3.5 py-1 rounded-lg text-sm font-bold bg-emerald-100/90 text-emerald-900 border border-emerald-300">
                  পদবী: {designation}
                </span>
              </div>

              {/* Contact and Address with Icons */}
              <div className="mt-4 space-y-1.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold text-slate-900">মোবাইল (লগইন আইডি):</span>
                  <span className="font-bold text-slate-950">{staff.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-slate-900">বর্তমান ঠিকানা:</span>{' '}
                    <span>{address}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Photo Column: Passport size photo box */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-32 h-38 sm:w-36 sm:h-44 rounded-xl bg-slate-50 border-2 border-slate-300 shadow-md overflow-hidden flex items-center justify-center p-1 bg-white">
                {staff.photoUrl ? (
                  <img
                    src={staff.photoUrl}
                    alt={staff.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center">
                    <span className="text-3xl font-black text-slate-300">ছবি</span>
                    <span className="text-[10px] text-slate-500 mt-1">পাসপোর্ট সাইজ</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1.5">
                পাসপোর্ট সাইজ ছবি
              </span>
            </div>

          </div>

          {/* Green Top Border Divider Line */}
          <div className="w-full h-1 bg-emerald-800 rounded-full mb-6 mt-2" />

          {/* SECTION 1: ব্যক্তিগত তথ্যাবলী (Personal Information) */}
          <div className="mb-6">
            {/* Section Header with Left Vertical Accent Bar */}
            <div className="flex items-center bg-slate-100/90 rounded-r-lg px-3 py-1.5 mb-3 border-l-4 border-emerald-800">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide">
                ১. ব্যক্তিগত তথ্যাবলী (Personal Information)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm px-2">
              <div className="flex items-baseline">
                <span className="w-40 text-slate-500 font-medium">পিতার নাম:</span>
                <span className="font-bold text-slate-900">{fatherName}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-40 text-slate-500 font-medium">মাতার নাম:</span>
                <span className="font-bold text-slate-900">{motherName}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-40 text-slate-500 font-medium">জাতীয় পরিচয়পত্র (NID):</span>
                <span className="font-bold text-slate-900 font-mono">{toBengaliNumber(nid)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-40 text-slate-500 font-medium">রক্তের গ্রুপ:</span>
                <span className="font-bold text-slate-900">{bloodGroup}</span>
              </div>
              <div className="flex items-baseline sm:col-span-2 pt-1 border-t border-slate-100">
                <span className="w-40 text-slate-500 font-medium shrink-0">স্থায়ী ঠিকানা:</span>
                <span className="font-bold text-slate-900">{permanentAddress}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: চাকুরির বিবরণ ও বেতন (Employment Details) */}
          <div className="mb-6">
            <div className="flex items-center bg-slate-100/90 rounded-r-lg px-3 py-1.5 mb-3 border-l-4 border-emerald-800">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide">
                ২. চাকুরির বিবরণ ও বেতন (Employment Details)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm px-2">
              <div className="flex items-baseline">
                <span className="w-40 text-slate-500 font-medium">নিযুক্ত পদবী:</span>
                <span className="font-bold text-emerald-800">{designation}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-40 text-slate-500 font-medium">মাসিক নির্ধারিত বেতন:</span>
                <span className="font-bold text-slate-900">{formatCurrency(salary)}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-40 text-slate-500 font-medium">যোগদানের তারিখ:</span>
                <span className="font-bold text-slate-900">{formatBengaliDate(joinedDate)}</span>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-slate-500 font-medium">চাকরির বর্তমান অবস্থা:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  সক্রিয় কর্মকর্তা (Active)
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: অন্যান্য বিবরণ ও জরুরি যোগাযোগ (Other Information) */}
          <div className="mb-6">
            <div className="flex items-center bg-slate-100/90 rounded-r-lg px-3 py-1.5 mb-3 border-l-4 border-emerald-800">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide">
                ৩. অন্যান্য বিবরণ ও জরুরি যোগাযোগ (Other Information)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm px-2">
              <div className="flex items-baseline">
                <span className="w-40 text-slate-500 font-medium">শিক্ষাগত যোগ্যতা:</span>
                <span className="font-bold text-slate-900">{education}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-40 text-slate-500 font-medium">জরুরি যোগাযোগ:</span>
                <span className="font-bold text-slate-900">{emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: সফটওয়্যার লগইন তথ্য ও অনুমতি (Mint Green Rounded Box) */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 mb-10">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-900 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>সফটওয়্যার লগইন তথ্য ও অনুমতি:</span>
            </div>
            <ul className="space-y-1 text-xs sm:text-sm text-slate-800 pl-4 list-disc">
              <li>
                স্টাফের লগইন মোবাইল: <strong className="font-bold text-slate-900">{staff.phone}</strong>
              </li>
              <li>
                স্টাফ পিন কোড: <strong className="font-bold text-slate-900 font-mono">{pin}</strong> (এই পিন দিয়ে স্টাফ সফটওয়্যারে ঢুকে আয়-ব্যয় এন্ট্রি দিতে পারবে)
              </li>
              <li>
                স্টাফ যেসব এন্ট্রি দিবে তাতে স্বয়ংক্রিয়ভাবে তার নাম ({staff.name}) সিলমোহর হিসেবে যুক্ত হবে।
              </li>
            </ul>
          </div>

          {/* SECTION 5: Signatures Row at the Bottom */}
          <div className="pt-10 flex items-center justify-between text-center px-4 sm:px-12">
            <div>
              <div className="w-44 sm:w-56 border-t-2 border-slate-400 mb-1.5"></div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                কর্মকর্তা / স্টাফের স্বাক্ষর
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">তারিখ: ________________</p>
            </div>

            <div>
              <div className="w-44 sm:w-56 border-t-2 border-slate-400 mb-1.5"></div>
              <p className="text-xs sm:text-sm font-bold text-emerald-900">
                মালিক / প্রধান কর্তৃপক্ষের স্বাক্ষর ও সীল
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">তারিখ: ________________</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
