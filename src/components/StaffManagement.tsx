import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Key,
  Calendar,
  Check,
  Edit2,
  Trash2,
  DollarSign,
  X,
  Eye,
  EyeOff,
  History,
  Printer,
  FileText,
  Upload,
  Camera,
  HeartPulse,
  GraduationCap
} from 'lucide-react';
import { Staff, Transaction, UserSession, Company } from '../types';
import { formatCurrency, toBengaliNumber, formatBengaliDate } from '../utils/formatters';
import { StaffSalaryHistoryModal } from './StaffSalaryHistoryModal';
import { StaffJoiningLetterModal } from './StaffJoiningLetterModal';

interface StaffManagementProps {
  staffs: Staff[];
  transactions: Transaction[];
  currentUser: UserSession;
  company?: Company | null;
  onAddStaff: (staff: Staff) => Promise<void>;
  onUpdateStaff: (id: string, staff: Partial<Staff>) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  onPaySalary: (staff: Staff) => void;
  openAddModalNonce?: number;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  staffs,
  transactions,
  currentUser,
  company,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onPaySalary,
  openAddModalNonce,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedStaffForHistory, setSelectedStaffForHistory] = useState<Staff | null>(null);
  const [selectedStaffForJoiningLetter, setSelectedStaffForJoiningLetter] = useState<Staff | null>(null);
  const [showPins, setShowPins] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nid, setNid] = useState('');
  const [address, setAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [education, setEducation] = useState('HSC');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [designation, setDesignation] = useState('সহকারী টেকনিশিয়ান');
  const [salary, setSalary] = useState<number | ''>(8000);
  const [pin, setPin] = useState('');
  const [joinedAt, setJoinedAt] = useState(() => new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState('');

  const openAddModal = () => {
    setEditingStaff(null);
    setName('');
    setFatherName('');
    setMotherName('');
    setPhone('');
    setEmail('');
    setNid('');
    setAddress('জাংগালিয়া মিঝি বাড়ি। ৩নং পশ্চিম ইলিশা ভোলা সদর ভোলা');
    setPermanentAddress('জাংগালিয়া মিঝি বাড়ি। ৩নং পশ্চিম ইলিশা ভোলা সদর ভোলা');
    setBloodGroup('O-');
    setEducation('HSC');
    setEmergencyContact('');
    setDesignation('সহকারী টেকনিশিয়ান');
    setSalary(8000);
    setPin(Math.floor(1000 + Math.random() * 9000).toString());
    setJoinedAt(new Date().toISOString().split('T')[0]);
    setPhotoUrl('');
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (openAddModalNonce && openAddModalNonce > 0) {
      openAddModal();
    }
  }, [openAddModalNonce]);

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setName(staff.name);
    setFatherName(staff.fatherName || '');
    setMotherName(staff.motherName || '');
    setPhone(staff.phone || '');
    setEmail(staff.email || '');
    setNid(staff.nid || '');
    setAddress(staff.address || '');
    setPermanentAddress(staff.permanentAddress || staff.address || '');
    setBloodGroup(staff.bloodGroup || 'O-');
    setEducation(staff.education || 'HSC');
    setEmergencyContact(staff.emergencyContact || staff.phone || '');
    setDesignation(staff.designation || 'সহকারী টেকনিশিয়ান');
    setSalary(staff.salary);
    setPin(staff.pin || '1234');
    setJoinedAt(staff.joinedAt || new Date().toISOString().split('T')[0]);
    setPhotoUrl(staff.photoUrl || '');
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const staffData: Partial<Staff> = {
      name: name.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      nid: nid.trim(),
      address: address.trim(),
      permanentAddress: permanentAddress.trim() || address.trim(),
      bloodGroup: bloodGroup.trim(),
      education: education.trim(),
      emergencyContact: emergencyContact.trim() || phone.trim(),
      designation: designation.trim(),
      salary: Number(salary) || 0,
      pin: pin.trim(),
      joinedAt,
      photoUrl: photoUrl.trim()
    };

    if (editingStaff) {
      await onUpdateStaff(editingStaff.id, staffData);
    } else {
      const newStaff: Staff = {
        id: `staff-${Date.now()}`,
        name: name.trim(),
        ...staffData
      } as Staff;
      await onAddStaff(newStaff);
    }
    setIsModalOpen(false);
  };

  const totalMonthlyPayroll = staffs.reduce((sum, s) => sum + (s.salary || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#043324] to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-emerald-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {toBengaliNumber(staffs.length)} জন সক্রিয় কর্মকর্তা
            </span>
            <span className="text-xs text-emerald-400 font-mono">লাইভ মনিটরিং</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            কেন্দ্রীয় স্টাফ তালিকা ও নিয়োগ মনিটরিং
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
            মাসিক মোট স্টাফ বেতন বাজেট:{' '}
            <span className="text-amber-300 font-extrabold text-base">{formatCurrency(totalMonthlyPayroll)}</span>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl transition-colors border border-slate-300 flex items-center gap-1.5 shadow-xs"
            title="সকল কর্মকর্তা ও টেকনিশিয়ানদের তালিকা প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>স্টাফ শিট প্রিন্ট</span>
          </button>
          <button
            onClick={() => setShowPins(!showPins)}
            className="px-3.5 py-2 text-xs font-bold text-emerald-100 bg-emerald-900/80 hover:bg-emerald-800 rounded-xl transition-colors border border-emerald-700/80 flex items-center gap-1.5"
            title="স্টাফদের লগইন পিন প্রদর্শন বা গোপন"
          >
            {showPins ? <EyeOff className="w-4 h-4 text-emerald-300" /> : <Eye className="w-4 h-4 text-emerald-300" />}
            <span>{showPins ? 'পিন গোপন' : 'লগইন পিন'}</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            নতুন স্টাফ নিয়োগ
          </button>
        </div>
      </div>

      {/* Staff Cards Grid with Colorful Badges & Direct Joining Letter Print */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {staffs.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-xs p-5 hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between"
          >
            {/* Top Row: Photo, Name, Badge, Actions */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  {/* Photo Container */}
                  <div className="w-16 h-18 sm:w-18 sm:h-20 rounded-xl bg-slate-50 text-emerald-800 font-bold flex items-center justify-center overflow-hidden border-2 border-emerald-600 shrink-0 shadow-sm p-0.5">
                    {staff.photoUrl ? (
                      <img src={staff.photoUrl} alt={staff.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-1">
                        <Users className="w-6 h-6 text-emerald-600" />
                        <span className="text-[9px] text-slate-500 mt-0.5">নো ছবি</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      {staff.name}
                    </h3>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 mt-1">
                      {staff.designation}
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      যোগদান: {formatBengaliDate(staff.joinedAt)}
                    </p>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(staff)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="তথ্য পরিবর্তন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`আপনি কি নিশ্চিতভাবে ${staff.name}-কে তালিকা থেকে মুছে ফেলতে চান?`)) {
                        onDeleteStaff(staff.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Personal & Official Details Table */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> মোবাইল / আইডি:
                  </span>
                  <span className="font-bold text-slate-900">{staff.phone}</span>
                </div>

                {staff.fatherName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">পিতার নাম:</span>
                    <span className="font-semibold text-slate-800">{staff.fatherName}</span>
                  </div>
                )}

                {staff.nid && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> জাতীয় পরিচয়পত্র (NID):
                    </span>
                    <span className="font-mono font-bold text-slate-800">{toBengaliNumber(staff.nid)}</span>
                  </div>
                )}

                {staff.address && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 flex items-center gap-1 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" /> ঠিকানা:
                    </span>
                    <span className="text-slate-800 text-right font-medium">{staff.address}</span>
                  </div>
                )}

                {/* Login PIN Card */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/90 border border-amber-300">
                  <span className="text-amber-900 font-bold flex items-center gap-1.5 text-xs">
                    <Key className="w-3.5 h-3.5 text-amber-700" /> মোবাইল লগইন পিন কোড:
                  </span>
                  <span className="font-mono font-black text-sm text-amber-950">
                    {showPins ? staff.pin : '••••'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Salary & Quick Actions (Joining Letter Print, Salary Pay, History) */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">মাসিক নির্ধারিত বেতন</span>
                  <span className="text-xl font-black text-emerald-800">{formatCurrency(staff.salary)}</span>
                </div>

                {/* High Priority: ছবি সহ প্রিন্ট কপি (নিয়োগপত্র ও সিভি) */}
                <button
                  onClick={() => setSelectedStaffForJoiningLetter(staff)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                  title="ইউজার রিকোয়েস্টেড ছবি সহ নিয়োগপত্র ও সিভি প্রিন্ট ফরম্যাট"
                >
                  <FileText className="w-4 h-4 text-emerald-300" />
                  <span>নিয়োগপত্র ও সিভি প্রিন্ট</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setSelectedStaffForHistory(staff)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-300"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  বেতন হিস্ট্রি
                </button>
                <button
                  onClick={() => onPaySalary(staff)}
                  className="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  বেতন পরিশোধ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#043324] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingStaff ? 'স্টাফ তথ্য পরিবর্তন ও সিভি আপডেট' : 'নতুন স্টাফ নিয়োগ ও সিভি এন্ট্রি'}
                </h3>
                <p className="text-xs text-emerald-300">ছবি ও বিস্তারিত তথ্যাবলী দিয়ে সম্পূর্ণ নিয়োগ ফরম পূরণ করুন</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Photo Upload Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-20 h-24 rounded-xl bg-white border-2 border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-inner p-0.5">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-1 text-slate-400">
                      <Camera className="w-6 h-6 text-slate-300" />
                      <span className="text-[10px] mt-1">পাসপোর্ট ছবি</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    পাসপোর্ট সাইজ ছবি আপলোড করুন
                  </label>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ছবি নির্বাচন করুন (কম্পিউটার/মোবাইল)</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1">অথবা ছবির লিঙ্ক নিচে পেস্ট করতে পারেন</p>
                  <input
                    type="text"
                    value={photoUrl.startsWith('data:') ? 'ছবি আপলোড করা হয়েছে (Data Image)' : photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="ছবির সরাসরি লিঙ্ক (যেমন: https://...)"
                    className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">স্টাফের নাম <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: মো: সাওন"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পদবি (Designation) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="যেমন: সহকারী টেকনিশিয়ান"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Phone & PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল (লগইন আইডি) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1321-454984"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">লগইন পিন (৪ ডিজিট) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="যেমন: 4984"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold"
                  />
                </div>
              </div>

              {/* Father Name & Mother Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="যেমন: আক্তার হোসেন"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মাতার নাম</label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="যেমন: হাসনা বেগম"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* NID & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">জাতীয় পরিচয়পত্র (NID)</label>
                  <input
                    type="text"
                    value={nid}
                    onChange={(e) => setNid(e.target.value)}
                    placeholder="যেমন: ২০০৯০৯১১৮৫৫১৩৮৪৪৩"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">রক্তের গ্রুপ</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold bg-white"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Education & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষাগত যোগ্যতা</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="যেমন: HSC / SSC / Diploma"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">জরুরি যোগাযোগ মোবাইল</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="জরুরি ফোন নম্বর"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Salary & Joining Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মাসিক নির্ধারিত বেতন (BDT) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">যোগদানের তারিখ</label>
                  <input
                    type="date"
                    value={joinedAt}
                    onChange={(e) => setJoinedAt(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Addresses */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বর্তমান ঠিকানা</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="যেমন: জাংগালিয়া মিঝি বাড়ি। ৩নং পশ্চিম ইলিশা ভোলা সদর ভোলা"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">স্থায়ী ঠিকানা</label>
                <input
                  type="text"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="স্থায়ী ঠিকানা (খালি রাখলে বর্তমান ঠিকানাই ব্যবহৃত হবে)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary History Sub-component Modal */}
      {selectedStaffForHistory && (
        <StaffSalaryHistoryModal
          staff={selectedStaffForHistory}
          transactions={transactions}
          onClose={() => setSelectedStaffForHistory(null)}
          onPaySalary={onPaySalary}
        />
      )}

      {/* Staff Joining Letter & CV with Photo Print Modal */}
      {selectedStaffForJoiningLetter && (
        <StaffJoiningLetterModal
          isOpen={!!selectedStaffForJoiningLetter}
          onClose={() => setSelectedStaffForJoiningLetter(null)}
          staff={selectedStaffForJoiningLetter}
          company={company || null}
        />
      )}
    </div>
  );
};
