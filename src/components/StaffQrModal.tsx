import React, { useState } from 'react';
import { X, QrCode, Printer, User, Phone, Shield, Building2, Check } from 'lucide-react';
import { Staff, Company } from '../types';

interface StaffQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffs: Staff[];
  company: Company | null;
}

export const StaffQrModal: React.FC<StaffQrModalProps> = ({
  isOpen,
  onClose,
  staffs,
  company
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffs[0]?.id || '');

  if (!isOpen) return null;

  const activeStaff = staffs.find((s) => s.id === selectedStaffId) || staffs[0];
  const companyName = company?.name || 'DIP BHOLA NETWORK';
  const companyOwner = company?.ownerName || 'জাহিদুল ইসলাম';
  const companyPhone = company?.phone || '01721200049';
  const companyAddress = company?.address || '৩নং পশ্চিম ইলিশা।ভোলা সদর ভোলা';

  const handlePrint = () => {
    window.print();
  };

  const getQrUrl = (staff: Staff) => {
    const dataString = `STAFF:${staff.name}|ROLE:${staff.designation}|PHONE:${staff.phone}|ID:${staff.id}|COMPANY:${companyName}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(dataString)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#064e3b] px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center justify-center text-emerald-200">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">স্টাফ কিউআর কোড ও আইডি কার্ড</h2>
              <p className="text-xs text-emerald-200">স্টাফদের ডিজিটাল কিউআর কোড স্ক্যান ও প্রিন্ট করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Staff Select Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
            {staffs.map((staff) => {
              const isSelected = (activeStaff?.id === staff.id);
              return (
                <button
                  key={staff.id}
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{staff.name}</span>
                </button>
              );
            })}
          </div>

          {activeStaff ? (
            <div className="flex flex-col items-center">
              {/* Printable ID Card Container */}
              <div
                id="staff-qr-card"
                className="w-full max-w-sm bg-white rounded-2xl border-2 border-emerald-800 p-5 shadow-lg relative overflow-hidden"
              >
                {/* Header Band */}
                <div className="text-center pb-3 border-b-2 border-emerald-800">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <img
                      src="/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg"
                      alt="Logo"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <h3 className="font-black text-slate-900 text-base tracking-wide uppercase">
                      {companyName}
                    </h3>
                  </div>
                  <p className="text-[10px] font-semibold text-emerald-800">
                    কেন্দ্রীয় স্টাফ ও টেকনিশিয়ান পরিচিতিপত্র
                  </p>
                </div>

                {/* QR Code and Info */}
                <div className="py-4 flex flex-col items-center text-center">
                  <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-300 shadow-inner flex items-center justify-center mb-3">
                    <img
                      src={getQrUrl(activeStaff)}
                      alt={`QR code for ${activeStaff.name}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">
                    {activeStaff.name}
                  </h4>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {activeStaff.designation}
                  </span>

                  <div className="mt-3 text-xs text-slate-600 space-y-1 w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">মোবাইল:</span>
                      <span className="font-bold text-slate-800">{activeStaff.phone}</span>
                    </div>
                    {activeStaff.nid && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">জাতীয় পরিচয়পত্র:</span>
                        <span className="font-semibold text-slate-700">{activeStaff.nid}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">স্টাফ আইডি:</span>
                      <span className="font-mono font-semibold text-slate-700">{activeStaff.id}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500">
                  <p className="font-semibold text-slate-700">{companyAddress}</p>
                  <p>পরিচালক: {companyOwner} • {companyPhone}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 text-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  প্রিন্ট আইডি কার্ড
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              কোনো স্টাফ পাওয়া যায়নি।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
