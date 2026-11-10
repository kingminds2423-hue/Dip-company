import React, { useMemo } from 'react';
import {
  X,
  History,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  Printer,
  Building2,
  Phone,
  MapPin
} from 'lucide-react';
import { Staff, Transaction } from '../types';
import { formatCurrency, toBengaliNumber, formatBengaliDate } from '../utils/formatters';

interface StaffSalaryHistoryModalProps {
  staff: Staff;
  transactions: Transaction[];
  onClose: () => void;
  onPaySalary: (staff: Staff) => void;
}

export const StaffSalaryHistoryModal: React.FC<StaffSalaryHistoryModalProps> = ({
  staff,
  transactions,
  onClose,
  onPaySalary,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Extract keywords from staff name (e.g. "সাওন" from "মো: সাওন", "জিহাদ" from "জিহাদ ")
  const staffKeywords = useMemo(() => {
    const rawParts = staff.name.split(/\s+/).map((p) => p.replace(/[.,:;]/g, '').trim()).filter((p) => p.length > 2);
    return [staff.name.trim(), ...rawParts];
  }, [staff.name]);

  // Filter transactions that represent salary payment for this staff
  const salaryHistory = useMemo(() => {
    return transactions.filter((tx) => {
      // Must be an expense transaction
      if (tx.type !== 'expense') return false;

      const isSalaryCategory =
        tx.category === 'স্টাফ বেতন ও ভাতা' ||
        (tx.note && tx.note.includes('বেতন')) ||
        (tx.title && tx.title.includes('বেতন'));

      if (!isSalaryCategory) return false;

      // Check if title or note matches staff name or keywords
      const titleLower = (tx.title || '').toLowerCase();
      const noteLower = (tx.note || '').toLowerCase();

      const matchesKeyword = staffKeywords.some((kw) => {
        const kwLower = kw.toLowerCase();
        return titleLower.includes(kwLower) || noteLower.includes(kwLower);
      });

      return matchesKeyword;
    });
  }, [transactions, staffKeywords]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalPaid = 0;
    salaryHistory.forEach((tx) => {
      totalPaid += tx.amount;
    });
    const paymentCount = salaryHistory.length;
    const lastPayment = salaryHistory[0]?.date || null;

    return {
      totalPaid,
      paymentCount,
      lastPayment
    };
  }, [salaryHistory]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none">
        
        {/* Printable Official Salary Pay Slip (Shown when printing) */}
        <div className="hidden print:block p-8 space-y-6">
          {/* Slip Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-slate-300 p-1 flex items-center justify-center">
                <img
                  src="/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg"
                  alt="Dip Bhola network"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  DIP BHOLA NETWORK
                </h1>
                <p className="text-xs font-semibold text-slate-700">দৈনিক আয়-ব্যয় ও কেন্দ্রীয় স্টাফ মনিটরিং সিস্টেম</p>
                <p className="text-[11px] text-slate-600">৩নং পশ্চিম ইলিশা।ভোলা সদর ভোলা • ০১৭১২১২০০০৪৯</p>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-slate-900 text-sm uppercase bg-slate-100 px-3 py-1 rounded border border-slate-300">
                কর্মচারী বেতন ভাউচার স্লিপ
              </div>
              <div className="mt-1 text-slate-600">মুদ্রণ তারিখ: {formatBengaliDate(todayStr)}</div>
              <div className="text-slate-600">স্টাফ আইডি: {staff.id}</div>
            </div>
          </div>

          {/* Staff Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 border border-slate-300 rounded-xl bg-slate-50 text-xs">
            <div>
              <div className="text-slate-500 font-medium">কর্মকর্তা / টেকনিশিয়ানের নাম:</div>
              <div className="text-base font-bold text-slate-900">{staff.name}</div>
              <div className="text-slate-600 font-medium mt-0.5">পদবি: {staff.designation}</div>
              {staff.phone && <div className="text-slate-600">মোবাইল: {staff.phone}</div>}
              {staff.nid && <div className="text-slate-600">জাতীয় পরিচয়পত্র: {staff.nid}</div>}
            </div>

            <div className="text-right">
              <div className="text-slate-500 font-medium">মাসিক নির্ধারিত বেতন:</div>
              <div className="text-xl font-extrabold text-slate-900">{formatCurrency(staff.salary)}</div>
              <div className="mt-2 text-slate-500 font-medium">সর্বমোট পরিশোধিত বেতন:</div>
              <div className="text-base font-bold text-slate-900">{formatCurrency(stats.totalPaid)}</div>
              <div className="text-[11px] text-slate-500">মোট কিস্তি: {toBengaliNumber(stats.paymentCount)} বার</div>
            </div>
          </div>

          {/* Salary Records Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              পরিশোধিত বেতনের বিস্তারিত হিসাব (Payment Records)
            </h3>
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                  <th className="py-2 px-3 border-r border-slate-300">ক্রমিক</th>
                  <th className="py-2 px-3 border-r border-slate-300">তারিখ</th>
                  <th className="py-2 px-3 border-r border-slate-300">বিবরণ / খাত</th>
                  <th className="py-2 px-3 border-r border-slate-300">পেমেন্ট মাধ্যম</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300">টাকার পরিমাণ</th>
                  <th className="py-2 px-3 border-r border-slate-300">অনুমোদনকারী</th>
                  <th className="py-2 px-3">লেনদেন আইডি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {salaryHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      কোনো বেতন পরিশোধ রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  salaryHistory.map((tx, idx) => (
                    <tr key={tx.id}>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-medium">
                        {toBengaliNumber(idx + 1)}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-semibold">
                        {tx.date} ({formatBengaliDate(tx.date)})
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium">
                        {tx.title}
                        {tx.note && <span className="block text-[10px] text-slate-500 italic">নোট: {tx.note}</span>}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        {tx.paymentMethod === 'bkash' ? 'বিকাশ' : tx.paymentMethod === 'bank' ? 'ব্যাংক' : 'নগদ ক্যাশ'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-bold">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        {tx.addedBy}
                      </td>
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-500">
                        {tx.id}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-400">
                  <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-300">
                    সর্বমোট পরিশোধিত বেতন:
                  </td>
                  <td className="py-2 px-3 text-right font-black border-r border-slate-300">
                    {formatCurrency(stats.totalPaid)}
                  </td>
                  <td colSpan={2} className="py-2 px-3 text-[10px] text-slate-500 italic">
                    পরিশোধ সংখ্যা: {toBengaliNumber(stats.paymentCount)} টি ভাউচার
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-16 flex justify-between items-end text-xs text-slate-800">
            <div className="text-center">
              <div className="w-40 border-b border-slate-600 mb-1"></div>
              <div className="font-bold">{staff.name}</div>
              <div className="text-[11px] text-slate-500">কর্মচারীর স্বাক্ষর ও তারিখ</div>
            </div>

            <div className="text-center">
              <div className="w-40 border-b border-slate-600 mb-1 ml-auto"></div>
              <div className="font-bold">জাহিদুল ইসলাম</div>
              <div className="text-[11px] text-slate-500">প্রধান পরিচালক, DIP BHOLA NETWORK</div>
            </div>
          </div>
        </div>

        {/* Modal UI Header (Screen view) */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">{staff.name} - বেতন পরিশোধের ইতিহাস</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {staff.designation}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                মাসিক নির্ধারিত বেতন: {formatCurrency(staff.salary)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-white/20"
              title="বেতন ভাউচার প্রিন্ট বা PDF সংরক্ষণ"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>প্রিন্ট স্লিপ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Staff Summary Banner (Screen view) */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">সর্বমোট পরিশোধিত বেতন</div>
              <div className="text-lg font-black text-rose-600 mt-0.5">
                {formatCurrency(stats.totalPaid)}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">পরিশোধের সংখ্যা</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {toBengaliNumber(stats.paymentCount)} বার
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">সর্বশেষ বেতন প্রদানের তারিখ</div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {stats.lastPayment ? formatBengaliDate(stats.lastPayment) : 'এখনো এন্ট্রি হয়নি'}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History List (Screen view) */}
        <div className="p-5 space-y-4 max-h-96 overflow-y-auto print:hidden">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>লেনদেন তালিকা থেকে পাওয়া বেতন রেকর্ড</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {toBengaliNumber(salaryHistory.length)} টি
              </span>
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-slate-300"
              >
                <Printer className="w-3.5 h-3.5" />
                প্রিন্ট
              </button>
              <button
                onClick={() => {
                  onClose();
                  onPaySalary(staff);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                নতুন বেতন পরিশোধ
              </button>
            </div>
          </div>

          {salaryHistory.length === 0 ? (
            <div className="py-12 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700">
                এই স্টাফের জন্য কোনো বেতন পরিশোধের রেকর্ড পাওয়া যায়নি
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                "নতুন বেতন পরিশোধ" বোতামে ক্লিক করে খুব সহজেই বেতন এন্ট্রি সংরক্ষণ করতে পারবেন।
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {salaryHistory.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {toBengaliNumber(idx + 1)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {tx.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatBengaliDate(tx.date)} ({tx.date})</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">পেমেন্ট: {tx.paymentMethod === 'bkash' ? 'বিকাশ' : tx.paymentMethod === 'bank' ? 'ব্যাংক' : 'নগদ ক্যাশ'}</span>
                        <span>•</span>
                        <span className="text-slate-600">অনুমোদনকারী: {tx.addedBy}</span>
                      </div>
                      {tx.note && (
                        <div className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          মন্তব্য: {tx.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 pl-11 sm:pl-0">
                    <div className="text-base font-extrabold text-rose-600">
                      -{formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {tx.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer (Screen view) */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>প্রিন্ট ভাউচার স্লিপ</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
