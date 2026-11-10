import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  DollarSign,
  Printer,
  UserPlus,
  RefreshCw,
  History,
  CheckCircle2,
  FileText,
  BadgeCheck,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Building2,
  FileCheck,
  Upload
} from 'lucide-react';
import { AppointedOfficer, OfficersState, Staff, Company, UserSession } from '../types';
import { formatCurrency, formatBengaliDate, toBengaliNumber } from '../utils/formatters';

interface OfficersViewProps {
  officers: OfficersState;
  staffs: Staff[];
  company: Company | null;
  currentUser: UserSession;
  onAppointOfficer: (
    type: 'manager' | 'auditor',
    officerData: Omit<AppointedOfficer, 'id' | 'status' | 'updatedAt'>
  ) => Promise<void>;
  onSaveAllOfficers: (officers: OfficersState) => Promise<void>;
}

export const OfficersView: React.FC<OfficersViewProps> = ({
  officers,
  staffs,
  company,
  currentUser,
  onAppointOfficer,
  onSaveAllOfficers
}) => {
  const [activeTab, setActiveTab] = useState<'manager' | 'auditor' | 'history'>('manager');
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [appointType, setAppointType] = useState<'manager' | 'auditor'>('manager');
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [letterOfficer, setLetterOfficer] = useState<AppointedOfficer | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for appointing new officer
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    phone: '',
    email: '',
    nid: '',
    fatherName: '',
    motherName: '',
    address: '',
    permanentAddress: '',
    education: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    salaryOrFee: 15000,
    scopeOfWork: '',
    photoUrl: '',
    appointedBy: company?.ownerName ? `${company.ownerName} (প্রধান পরিচালক)` : 'জাহিদুল ইসলাম (প্রধান পরিচালক)',
    notes: '',
    termsText: ''
  });

  const companyName = company?.name || 'DIP BHOLA NETWORK';
  const ownerName = company?.ownerName || 'জাহিদুল ইসলাম';
  const companyPhone = company?.phone || '01721200049';
  const companyAddress = company?.address || '৩নং পশ্চিম ইলিশা।ভোলা সদর ভোলা';

  // Open Appoint Modal
  const handleOpenAppoint = (type: 'manager' | 'auditor') => {
    setAppointType(type);
    const current = type === 'manager' ? officers.manager : officers.auditor;

    if (type === 'manager') {
      setFormData({
        name: current.name || '',
        designation: current.designation || 'শাখা ও জেনারেল ম্যানেজার',
        phone: current.phone || '',
        email: current.email || '',
        nid: current.nid || '',
        fatherName: current.fatherName || '',
        motherName: current.motherName || '',
        address: current.address || '',
        permanentAddress: current.permanentAddress || current.address || '',
        education: current.education || 'স্নাতক / স্নাতকোত্তর',
        appointmentDate: new Date().toISOString().split('T')[0],
        salaryOrFee: current.salaryOrFee || 15000,
        scopeOfWork: current.scopeOfWork || 'শাখার সার্বিক পরিচালনা, দৈনিক ক্যাশ কালেকশন তদারকি, স্টাফদের কর্মবণ্টন এবং কেন্দ্রীয় বিলিং ব্যবস্থাপনা।',
        photoUrl: current.photoUrl || '',
        appointedBy: `${ownerName} (প্রধান পরিচালক)`,
        notes: '',
        termsText: current.terms?.join('\n') || [
          'শাখার সার্বিক পরিচালনা, কর্মী মনিটরিং ও দৈনিক কালেকশন তত্ত্বাবধান করবেন।',
          'প্রতিদিনের আয়-ব্যয় কেন্দ্রীয় ক্যাশ খাতায় নির্ভুলভাবে এন্ট্রি নিশ্চিত করবেন।',
          'গ্রাহক সেবা, অভিযোগ নিস্পত্তি ও জরুরি লাইন মেরামতে সার্বক্ষণিক সক্রিয় থাকবেন।'
        ].join('\n')
      });
    } else {
      setFormData({
        name: current.name || '',
        designation: current.designation || 'অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট কর্মকর্তা)',
        phone: current.phone || '',
        email: current.email || '',
        nid: current.nid || '',
        fatherName: current.fatherName || '',
        motherName: current.motherName || '',
        address: current.address || '',
        permanentAddress: current.permanentAddress || current.address || '',
        education: current.education || 'এম.কম (অ্যাকাউন্টিং) / সিএ সিসি',
        appointmentDate: new Date().toISOString().split('T')[0],
        salaryOrFee: current.salaryOrFee || 6000,
        scopeOfWork: current.scopeOfWork || 'মাসিক সকল খরচের ভাউচার নিরীক্ষণ, ক্যাশ ও ব্যাংক হিসাব প্রতিপাদন, অডিট রিপোর্ট প্রণয়ন ও স্বচ্ছতা নিশ্চিতকরণ।',
        photoUrl: current.photoUrl || '',
        appointedBy: `${ownerName} (প্রধান পরিচালক)`,
        notes: '',
        termsText: current.terms?.join('\n') || [
          'প্রতি মাসের হিসাব ও ব্যয় ভাউচার স্বাধীন ও নিরপেক্ষভাবে নিরীক্ষা করবেন।',
          'আর্থিক কোনো অসঙ্গতি বা ঘাটতি পরিলক্ষিত হলে তাৎক্ষণিক লিখিতভাবে পরিচালককে অবহিত করবেন।',
          'মাসিক আর্থিক বিবরণীতে নিরীক্ষা প্রত্যয়ন ও বৈধ স্বাক্ষর প্রদান করবেন।'
        ].join('\n')
      });
    }

    setIsAppointModalOpen(true);
  };

  // Populate from existing staff (promotion/assignment to manager)
  const handleSelectStaff = (staffId: string) => {
    const s = staffs.find((st) => st.id === staffId);
    if (!s) return;
    setFormData((prev) => ({
      ...prev,
      name: s.name,
      phone: s.phone,
      email: s.email || prev.email,
      nid: s.nid || prev.nid,
      fatherName: s.fatherName || prev.fatherName,
      motherName: s.motherName || prev.motherName,
      address: s.address || prev.address,
      permanentAddress: s.permanentAddress || prev.permanentAddress,
      education: s.education || prev.education,
      salaryOrFee: s.salary || prev.salaryOrFee,
      photoUrl: s.photoUrl || prev.photoUrl
    }));
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ ২ মেগাবাইট হতে পারবে।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Save new Appointment
  const handleSaveAppoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('কর্মকর্তার নাম প্রদান করুন।');
      return;
    }
    if (!formData.phone.trim()) {
      alert('মোবাইল নাম্বার প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const termsArray = formData.termsText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      await onAppointOfficer(appointType, {
        type: appointType,
        name: formData.name.trim(),
        designation: formData.designation.trim() || (appointType === 'manager' ? 'শাখা ও জেনারেল ম্যানেজার' : 'অভ্যন্তরীণ হিসাব নিরীক্ষক'),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        nid: formData.nid.trim(),
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        address: formData.address.trim(),
        permanentAddress: formData.permanentAddress.trim() || formData.address.trim(),
        education: formData.education.trim(),
        appointmentDate: formData.appointmentDate,
        salaryOrFee: Number(formData.salaryOrFee) || 0,
        scopeOfWork: formData.scopeOfWork.trim(),
        photoUrl: formData.photoUrl,
        appointedBy: formData.appointedBy.trim(),
        terms: termsArray,
        notes: formData.notes.trim()
      });

      setIsAppointModalOpen(false);
    } catch (err) {
      console.error('Failed to appoint officer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open official appointment letter view
  const handleOpenLetter = (officer: AppointedOfficer) => {
    setLetterOfficer(officer);
    setIsLetterModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                প্রশাসনিক ও অডিট গভর্ন্যান্স
              </span>
              <span className="text-xs text-emerald-400 font-semibold">• লাইভ সক্রিয়</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <UserCheck className="w-8 h-8 text-emerald-400" />
              <span>শাখা/জেনারেল ম্যানেজার ও হিসাব নিরীক্ষক নিয়োগ ব্যবস্থা</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              শাখা ও জেনারেল ম্যানেজার পরিবর্তন, অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট) নিয়োগ, 
              দায়িত্ব অর্পণ এবং অফিশিয়াল নিয়োগপত্র (Appointment Letter) প্রস্তুত ও প্রিন্ট করার কেন্দ্রীয় প্যানেল।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleOpenAppoint('manager')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>ম্যানেজার নিয়োগ / পরিবর্তন</span>
            </button>
            <button
              onClick={() => handleOpenAppoint('auditor')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-900/40 flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>অডিটর নিয়োগ / পরিবর্তন</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'manager'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>১. শাখা ও জেনারেল ম্যানেজার</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-full">সক্রিয়</span>
          </button>

          <button
            onClick={() => setActiveTab('auditor')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'auditor'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>২. অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-full">সক্রিয়</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>৩. পূর্ববর্তী কর্মকর্তা ও নিয়োগের ইতিহাস</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-full font-mono">
              {toBengaliNumber((officers.history || []).length)}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: শাখা ও জেনারেল ম্যানেজার */}
      {activeTab === 'manager' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200">
              {/* Profile Details */}
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 p-1 overflow-hidden shrink-0 shadow-md flex items-center justify-center">
                  {officers.manager.photoUrl ? (
                    <img
                      src={officers.manager.photoUrl}
                      alt={officers.manager.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-700 text-white rounded-xl">
                      <Briefcase className="w-10 h-10 mb-1 opacity-90" />
                      <span className="text-[10px] font-bold">ম্যানেজার</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{officers.manager.designation || 'শাখা ও জেনারেল ম্যানেজার'}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      নিয়োগ তারিখ: {toBengaliNumber(officers.manager.appointmentDate)}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {officers.manager.name}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-slate-800">মোবাইল:</span>
                      <span className="font-mono font-bold text-slate-900">{officers.manager.phone}</span>
                    </div>
                    {officers.manager.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-800">ইমেইল:</span>
                        <span>{officers.manager.email}</span>
                      </div>
                    )}
                    {officers.manager.nid && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700">NID:</span>
                        <span className="font-mono">{officers.manager.nid}</span>
                      </div>
                    )}
                    {officers.manager.education && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700">যোগ্যতা:</span>
                        <span>{officers.manager.education}</span>
                      </div>
                    )}
                    {officers.manager.fatherName && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">পিতা:</span>
                        <span>{officers.manager.fatherName}</span>
                      </div>
                    )}
                    {officers.manager.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-800">ঠিকানা:</span>
                        <span className="truncate">{officers.manager.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Manager */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => handleOpenLetter(officers.manager)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                  title="অফিসিয়াল সিলমোহর ও স্বাক্ষরিত নিয়োগপত্র দেখুন বা প্রিন্ট করুন"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>ম্যানেজার নিয়োগপত্র (প্রিন্ট কপি)</span>
                </button>
                <button
                  onClick={() => handleOpenAppoint('manager')}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  <span>ম্যানেজার পরিবর্তন / নতুন নিয়োগ</span>
                </button>
              </div>
            </div>

            {/* Manager Responsibilities & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-700" />
                  <span>শাখা ম্যানেজারের মূল দায়িত্ব ও কর্মপরিধি (Scope of Work)</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {officers.manager.scopeOfWork || 'শাখার সার্বিক পরিচালনা, কর্মী মনিটরিং ও বিলিং ব্যবস্থাপনা।'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">মাসিক নির্ধারিত বেতন:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {formatCurrency(officers.manager.salaryOrFee || 15000)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>নিয়োগের শর্তাবলী ও নিয়মনীতি (Terms & Policy)</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {(officers.manager.terms || [
                    'শাখার সার্বিক পরিচালনা, কর্মী মনিটরিং ও দৈনিক কালেকশন তত্ত্বাবধান করবেন।',
                    'প্রতিদিনের আয়-ব্যয় কেন্দ্রীয় ক্যাশ খাতায় নির্ভুলভাবে এন্ট্রি নিশ্চিত করবেন।'
                  ]).map((term, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট) */}
      {activeTab === 'auditor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200">
              {/* Profile Details */}
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-amber-50 border-2 border-amber-500/40 p-1 overflow-hidden shrink-0 shadow-md flex items-center justify-center">
                  {officers.auditor.photoUrl ? (
                    <img
                      src={officers.auditor.photoUrl}
                      alt={officers.auditor.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-amber-600 to-orange-700 text-white rounded-xl">
                      <ShieldCheck className="w-10 h-10 mb-1 opacity-90" />
                      <span className="text-[10px] font-bold">অডিটর</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>{officers.auditor.designation || 'অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট কর্মকর্তা)'}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      নিয়োগ তারিখ: {toBengaliNumber(officers.auditor.appointmentDate)}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {officers.auditor.name}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-semibold text-slate-800">মোবাইল:</span>
                      <span className="font-mono font-bold text-slate-900">{officers.auditor.phone}</span>
                    </div>
                    {officers.auditor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold text-slate-800">ইমেইল:</span>
                        <span>{officers.auditor.email}</span>
                      </div>
                    )}
                    {officers.auditor.nid && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-700">NID/রেজি:</span>
                        <span className="font-mono">{officers.auditor.nid}</span>
                      </div>
                    )}
                    {officers.auditor.education && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-700">পেশাগত যোগ্যতা:</span>
                        <span>{officers.auditor.education}</span>
                      </div>
                    )}
                    {officers.auditor.fatherName && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">পিতা:</span>
                        <span>{officers.auditor.fatherName}</span>
                      </div>
                    )}
                    {officers.auditor.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold text-slate-800">ঠিকানা:</span>
                        <span className="truncate">{officers.auditor.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Auditor */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => handleOpenLetter(officers.auditor)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                  title="অফিসিয়াল অডিট নিয়োগপত্র ও দায়িত্ব অর্পণ পত্র প্রিন্ট বা সংরক্ষণ করুন"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>অডিটর নিয়োগপত্র (প্রিন্ট কপি)</span>
                </button>
                <button
                  onClick={() => handleOpenAppoint('auditor')}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>অডিটর পরিবর্তন / নতুন নিয়োগ</span>
                </button>
              </div>
            </div>

            {/* Auditor Scope & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>হিসাব নিরীক্ষকের দায়িত্ব ও অডিট পরিধি (Audit Scope)</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {officers.auditor.scopeOfWork || 'মাসিক সকল খরচের ভাউচার নিরীক্ষণ, ক্যাশ ও ব্যাংক হিসাব প্রতিপাদন ও স্বচ্ছতা নিশ্চিতকরণ।'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">মাসিক অডিট ফি / পারিতোষিক:</span>
                  <span className="font-black text-amber-800 text-sm">
                    {formatCurrency(officers.auditor.salaryOrFee || 6000)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-700" />
                  <span>নিরীক্ষা ও নিরাপত্তা নীতিমালা (Audit Charter)</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {(officers.auditor.terms || [
                    'প্রতি মাসের হিসাব ও ব্যয় ভাউচার স্বাধীন ও নিরপেক্ষভাবে নিরীক্ষা করবেন।',
                    'আর্থিক কোনো অসঙ্গতি বা ঘাটতি পরিলক্ষিত হলে তাৎক্ষণিক লিখিতভাবে পরিচালককে অবহিত করবেন।'
                  ]).map((term, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: পূর্ববর্তী কর্মকর্তা ও নিয়োগ ইতিহাস */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                পূর্বে নিয়োগপ্রাপ্ত কর্মকর্তা ও দায়িত্বের রেকর্ড (Historical Appointees)
              </h3>
              <p className="text-xs text-slate-500">
                পূর্বে দায়িত্ব পালনকারী শাখা ম্যানেজার এবং হিসাব নিরীক্ষকদের সংরক্ষিত ইতিহাস
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
              মোট রেকর্ড: {toBengaliNumber((officers.history || []).length)} টি
            </span>
          </div>

          {(officers.history || []).length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              এখনো কোনো পূর্ববর্তী কর্মকর্তার রেকর্ড নেই। বর্তমান কর্মকর্তারা স্বপদে সক্রিয় আছেন।
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">পদবী / ধরন</th>
                    <th className="py-3 px-4">কর্মকর্তার নাম</th>
                    <th className="py-3 px-4">মোবাইল</th>
                    <th className="py-3 px-4">নিয়োগের তারিখ</th>
                    <th className="py-3 px-4">দায়িত্ব সমাপ্তি</th>
                    <th className="py-3 px-4">মাসিক বেতন/ফি</th>
                    <th className="py-3 px-4">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(officers.history || []).map((hist, hIdx) => (
                    <tr key={hist.id || hIdx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            hist.type === 'manager'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {hist.designation}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{hist.name}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{hist.phone}</td>
                      <td className="py-2.5 px-4 text-slate-600">{toBengaliNumber(hist.appointmentDate)}</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {hist.updatedAt ? toBengaliNumber(hist.updatedAt.split('T')[0]) : 'পরিবর্তিত'}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">
                        {formatCurrency(hist.salaryOrFee || 0)}
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => handleOpenLetter(hist)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          নিয়োগপত্র
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: নিয়োগ / পরিবর্তন ফরম (Appointment Modal) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isAppointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div
              className={`px-6 py-4 flex items-center justify-between text-white shrink-0 ${
                appointType === 'manager' ? 'bg-[#043324]' : 'bg-[#451a03]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  {appointType === 'manager' ? (
                    <Briefcase className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-base">
                    {appointType === 'manager'
                      ? 'নতুন শাখা / জেনারেল ম্যানেজার নিয়োগ ও পরিবর্তন'
                      : 'নতুন অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট) নিয়োগ ও পরিবর্তন'}
                  </h3>
                  <p className="text-xs text-white/70">
                    পূর্ববর্তী কর্মকর্তার রেকর্ড স্বয়ংক্রিয়ভাবে হিস্ট্রিতে সংরক্ষিত হবে
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAppointModalOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveAppoint} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Option to promote from existing staff (if manager) */}
              {appointType === 'manager' && staffs.length > 0 && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-emerald-900 block text-xs">
                      বিদ্যমান কোনো স্টাফকে পদোন্নতি দিয়ে ম্যানেজার বানাতে চান?
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      নিচের ড্রপডাউন থেকে সিলেক্ট করলে তার ছবি ও তথ্য স্বয়ংক্রিয়ভাবে ফিল হবে
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleSelectStaff(e.target.value);
                    }}
                    className="bg-white border border-emerald-300 text-emerald-900 font-bold rounded-xl px-3 py-1.5 text-xs focus:ring-emerald-500"
                    defaultValue=""
                  >
                    <option value="">-- স্টাফদের তালিকা থেকে বাছাই করুন --</option>
                    {staffs.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.designation})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    কর্মকর্তার পূর্ণ নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: মোঃ সাইফুল ইসলাম"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    অফিসিয়াল পদবী <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder={appointType === 'manager' ? 'শাখা ও জেনারেল ম্যানেজার' : 'অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট কর্মকর্তা)'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    মোবাইল নাম্বার <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="০১৭১২৩৪৫৬৭৮"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    জাতীয় পরিচয়পত্র নম্বর (NID / Reg No)
                  </label>
                  <input
                    type="text"
                    value={formData.nid}
                    onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                    placeholder="জাতীয় পরিচয়পত্র নম্বর"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    শিক্ষাগত ও পেশাগত যোগ্যতা
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    placeholder="যেমন: স্নাতকোত্তর / এম.কম (অ্যাকাউন্টিং) / সিএ"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="পিতার নাম"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">মাতার নাম</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="মাতার নাম"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Financials & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {appointType === 'manager' ? 'মাসিক বেতন (টাকা)' : 'মাসিক অডিট ফি / পারিতোষিক'}
                  </label>
                  <input
                    type="number"
                    value={formData.salaryOrFee}
                    onChange={(e) => setFormData({ ...formData, salaryOrFee: Number(e.target.value) })}
                    placeholder="টাকার পরিমাণ"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">নিয়োগের কার্যকরী তারিখ</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">নিয়োগকারী কর্তৃপক্ষ</label>
                  <input
                    type="text"
                    value={formData.appointedBy}
                    onChange={(e) => setFormData({ ...formData, appointedBy: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">বর্তমান ঠিকানা</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="বর্তমান ঠিকানা"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">স্থায়ী ঠিকানা</label>
                  <input
                    type="text"
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    placeholder="স্থায়ী ঠিকানা"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Scope of Work */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  দায়িত্ব ও কর্মপরিধি (Scope of Work / Authority)
                </label>
                <textarea
                  rows={2}
                  value={formData.scopeOfWork}
                  onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
                  placeholder="কর্মকর্তার মূল দায়িত্বসমূহ..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Terms and Conditions (One per line) */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  নিয়োগের প্রধান শর্তাবলী (প্রতি লাইনে একটি শর্ত লিখুন)
                </label>
                <textarea
                  rows={3}
                  value={formData.termsText}
                  onChange={(e) => setFormData({ ...formData, termsText: e.target.value })}
                  placeholder="শর্তাবলী লিখুন..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">কর্মকর্তার পাসপোর্ট সাইজ ছবি</span>
                    <span className="text-[11px] text-slate-500">নিয়োগপত্রে ছবি যুক্ত করতে সিলেক্ট করুন</span>
                  </div>
                </div>

                <label className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shrink-0">
                  <span>ছবি নির্বাচন</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              {/* Modal Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAppointModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md transition-all flex items-center gap-2 ${
                    appointType === 'manager'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-amber-700 hover:bg-amber-800'
                  }`}
                >
                  {isSubmitting ? (
                    <span>নিয়োগ প্রক্রিয়াকরণ হচ্ছে...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {appointType === 'manager'
                          ? 'নতুন ম্যানেজার হিসেবে নিয়োগ ও অনুমোদন দিন'
                          : 'নতুন হিসাব নিরীক্ষক হিসেবে নিয়োগ ও অনুমোদন দিন'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: অফিসিয়াল নিয়োগপত্র প্রিন্ট ও ভিউ (Appointment Letter Modal) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isLetterModalOpen && letterOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none">
            {/* Top Bar (Hidden on print) */}
            <div className="bg-[#03291d] px-6 py-3.5 flex items-center justify-between text-white shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base">
                  {letterOfficer.type === 'manager'
                    ? 'শাখা / জেনারেল ম্যানেজার অফিসিয়াল নিয়োগপত্র'
                    : 'অভ্যন্তরীণ হিসাব নিরীক্ষক (অডিট) দায়িত্ব অর্পণ ও নিয়োগপত্র'}
                </span>
                <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded-full text-emerald-200 font-bold">
                  সিলমোহর ও স্বাক্ষরযুক্ত
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন (PDF)</span>
                </button>
                <button
                  onClick={() => setIsLetterModalOpen(false)}
                  className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Appointment Letter Body (A4 Letterhead) */}
            <div className="p-8 sm:p-12 bg-white text-slate-800 font-sans print:p-6 print:m-0 space-y-6">
              {/* Letterhead Header */}
              <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={company?.logoUrl || '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg'}
                      alt={companyName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                      {companyName}
                    </h1>
                    <p className="text-xs font-semibold text-slate-700">{company?.subTitle || 'ডিজিটাল নেটওয়ার্ক ও ইন্টারনেট ব্রডব্যান্ড সেবা'}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      ঠিকানা: {companyAddress} | মোবাইল: {companyPhone}
                    </p>
                  </div>
                </div>

                {/* Candidate Photo on Letterhead */}
                <div className="w-20 h-24 border border-slate-300 rounded-lg p-0.5 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {letterOfficer.photoUrl ? (
                    <img src={letterOfficer.photoUrl} alt={letterOfficer.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="text-[10px] text-center text-slate-400 font-semibold">পাসপোর্ট ছবি</div>
                  )}
                </div>
              </div>

              {/* Memo & Date Meta */}
              <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                <div>
                  স্মারক নং: <span className="font-mono font-bold text-slate-900">DIP/HR/{letterOfficer.type.toUpperCase()}/{letterOfficer.id.substring(4, 12)}</span>
                </div>
                <div>
                  তারিখ: <span className="font-bold text-slate-900">{formatBengaliDate(letterOfficer.appointmentDate)}</span>
                </div>
              </div>

              {/* Recipient Block */}
              <div className="text-xs text-slate-800 space-y-1">
                <div>বরাবর,</div>
                <div className="font-extrabold text-slate-950 text-sm">{letterOfficer.name}</div>
                {letterOfficer.fatherName && <div>পিতা: {letterOfficer.fatherName}</div>}
                {letterOfficer.address && <div>ঠিকানা: {letterOfficer.address}</div>}
                <div>মোবাইল: {letterOfficer.phone}</div>
              </div>

              {/* Subject */}
              <div className="bg-slate-100 print:bg-slate-100 p-2.5 rounded-lg border-l-4 border-slate-800 font-black text-xs sm:text-sm text-slate-950">
                বিষয়: {letterOfficer.designation} পদে নিয়োগ প্রদান ও কার্যভার অর্পণ সংক্রান্ত।
              </div>

              {/* Letter Body Opening */}
              <div className="text-xs leading-relaxed text-slate-800 space-y-3">
                <p>জনাব,</p>
                <p className="text-justify">
                  অত্যন্ত আনন্দের সাথে জানানো যাচ্ছে যে, <strong>{companyName}</strong> পরিচালনা পর্ষদের সিদ্ধান্ত অনুযায়ী 
                  আপনার মেধা, দক্ষতা এবং পূর্ব অভিজ্ঞতার ভিত্তিতে আপনাকে অত্র প্রতিষ্ঠানে <strong>{letterOfficer.designation}</strong> পদে 
                  সদয় নিয়োগ প্রদান করা হলো। আপনার অত্র নিয়োগ <strong>{formatBengaliDate(letterOfficer.appointmentDate)}</strong> তারিখ হতে কার্যকর বলে গণ্য হবে।
                </p>

                {/* Scope of Work */}
                <div className="bg-slate-50 print:bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">মূল দায়িত্ব ও কর্মপরিধি:</div>
                  <p className="text-slate-700">{letterOfficer.scopeOfWork}</p>
                </div>

                {/* Terms and Financials */}
                <div className="space-y-1.5 pt-1">
                  <div className="font-bold text-slate-900">নিয়োগের প্রধান শর্তাবলী:</div>
                  <ul className="list-decimal list-inside space-y-1 text-slate-700">
                    <li>
                      <strong>সম্মানী / বেতন:</strong> আপনাকে প্রতি মাসে সর্বসাকুল্যে <strong>{formatCurrency(letterOfficer.salaryOrFee || 0)}</strong> (টাকা) প্রদান করা হবে।
                    </li>
                    {(letterOfficer.terms || []).map((term, idx) => (
                      <li key={idx}>
                        <span>{term}</span>
                      </li>
                    ))}
                    <li>
                      প্রতিষ্ঠানের সকল আর্থিক ও গ্রাহক তথ্য সর্বোচ্চ গোপনীয়তা এবং বিশ্বস্ততার সাথে রক্ষা করতে বাধ্য থাকবেন।
                    </li>
                  </ul>
                </div>

                <p className="pt-2">
                  আমরা দৃঢ়ভাবে বিশ্বাস করি যে আপনার দায়িত্বশীলতা, সততা ও নিবেদিত প্রচেষ্টায় আমাদের প্রতিষ্ঠান উত্তরোত্তর সাফল্য অর্জন করবে।
                </p>
              </div>

              {/* Formal Dual Signature Footer */}
              <div className="pt-12 flex items-end justify-between text-xs text-slate-800">
                {/* Left: Appointee Acceptance */}
                <div className="text-center w-52">
                  <div className="h-10 flex items-end justify-center">
                    <span className="text-[10px] text-slate-400 italic print:hidden">স্বাক্ষর করুন</span>
                  </div>
                  <div className="border-b-2 border-slate-800 mb-1"></div>
                  <div className="font-extrabold text-slate-950">{letterOfficer.name}</div>
                  <div className="text-slate-600 text-[11px]">প্রার্থীর সম্মতি ও যোগদান স্বাক্ষর</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">তারিখ: ............................</div>
                </div>

                {/* Right: Director Seal & Signature */}
                <div className="text-center w-56 relative">
                  {/* Seal Stamp */}
                  <div className="absolute -top-10 right-4 w-20 h-20 rounded-full border-2 border-dashed border-emerald-700 print:border-black flex flex-col items-center justify-center text-[8px] text-emerald-800 print:text-black font-extrabold rotate-[-6deg] opacity-80 pointer-events-none">
                    <span>DIP BHOLA</span>
                    <span className="text-[7px]">★ SEAL ★</span>
                    <span>অনুমোদিত</span>
                  </div>

                  <div className="h-10 flex items-end justify-center">
                    <span className="text-[10px] text-slate-400 italic print:hidden">পরিচালকের স্বাক্ষর</span>
                  </div>
                  <div className="border-b-2 border-slate-800 mb-1"></div>
                  <div className="font-extrabold text-slate-950">{ownerName}</div>
                  <div className="text-slate-700 font-semibold text-[11px]">প্রধান পরিচালক ও ব্যবস্থাপনা অংশীদার</div>
                  <div className="text-[10px] text-slate-500">{companyName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
