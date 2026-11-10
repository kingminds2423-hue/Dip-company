import React, { useState, useMemo } from 'react';
import {
  Coins,
  Plus,
  Search,
  CheckCircle2,
  Phone,
  MapPin,
  Trash2,
  Edit,
  DollarSign,
  X,
  Check
} from 'lucide-react';
import { CustomerDue, UserSession } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/formatters';

interface CustomerDuesViewProps {
  customerDues: CustomerDue[];
  currentUser: UserSession;
  onAddCustomerDue: (due: Omit<CustomerDue, 'id' | 'updatedAt'>) => Promise<void>;
  onUpdateCustomerDue: (id: string, updates: Partial<CustomerDue>) => Promise<void>;
  onDeleteCustomerDue: (id: string) => Promise<void>;
  onCollectPayment: (due: CustomerDue, amount: number, paymentMethod: string) => Promise<void>;
}

export const CustomerDuesView: React.FC<CustomerDuesViewProps> = ({
  customerDues,
  currentUser,
  onAddCustomerDue,
  onUpdateCustomerDue,
  onDeleteCustomerDue,
  onCollectPayment,
}) => {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [collectingDue, setCollectingDue] = useState<CustomerDue | null>(null);
  const [collectAmount, setCollectAmount] = useState<number | ''>('');
  const [collectMethod, setCollectMethod] = useState('cash');

  // New due state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [totalDue, setTotalDue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const filteredDues = useMemo(() => {
    return customerDues.filter((d) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        d.customerName.toLowerCase().includes(q) ||
        (d.phone && d.phone.includes(q)) ||
        (d.address && d.address.toLowerCase().includes(q))
      );
    });
  }, [customerDues, search]);

  const totalOutstandingDue = customerDues.reduce((sum, d) => sum + (d.currentDue || 0), 0);
  const totalCollected = customerDues.reduce((sum, d) => sum + (d.paidAmount || 0), 0);

  const handleCreateDue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !totalDue || Number(totalDue) <= 0) return;

    await onAddCustomerDue({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      totalDue: Number(totalDue),
      paidAmount: 0,
      currentDue: Number(totalDue),
      notes: notes.trim(),
    });

    setIsAddModalOpen(false);
    setCustomerName('');
    setPhone('');
    setAddress('');
    setTotalDue('');
    setNotes('');
  };

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingDue || !collectAmount || Number(collectAmount) <= 0) return;

    await onCollectPayment(collectingDue, Number(collectAmount), collectMethod);
    setCollectingDue(null);
    setCollectAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>গ্রাহক বিল বকেয়া ও আদায় খাতা</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              {toBengaliNumber(customerDues.length)} জন গ্রাহক
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            সর্বমোট অনাদায়ী বকেয়া: <span className="text-rose-600 font-bold">{formatCurrency(totalOutstandingDue)}</span> | সর্বমোট আদায়: <span className="text-emerald-600 font-bold">{formatCurrency(totalCollected)}</span>
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          নতুন বকেয়া এন্ট্রি
        </button>
      </div>

      {/* Search box */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="গ্রাহকের নাম, ফোন বা এলাকা দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Dues Cards/Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">গ্রাহকের নাম ও এলাকা</th>
                <th className="py-3 px-4">ফোন নম্বর</th>
                <th className="py-3 px-4 text-right">মোট বকেয়া</th>
                <th className="py-3 px-4 text-right">আদায়কৃত</th>
                <th className="py-3 px-4 text-right">অবশিষ্ট বকেয়া</th>
                <th className="py-3 px-4">নোট</th>
                <th className="py-3 px-4 text-center">আদায় ও অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredDues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    কোনো বকেয়া রেকর্ড পাওয়া যায়নি। নতুন এন্ট্রি দিন।
                  </td>
                </tr>
              ) : (
                filteredDues.map((due) => (
                  <tr key={due.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{due.customerName}</div>
                      {due.address && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{due.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {due.phone || 'দেওয়া হয়নি'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {formatCurrency(due.totalDue)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      {formatCurrency(due.paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600 text-sm">
                      {formatCurrency(due.currentDue)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs italic">
                      {due.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {due.currentDue > 0 ? (
                          <button
                            onClick={() => {
                              setCollectingDue(due);
                              setCollectAmount(due.currentDue);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            টাকা আদায়
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> পরিশোধিত
                          </span>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${due.customerName}" এর বকেয়া মুছে ফেলতে চান?`)) {
                              onDeleteCustomerDue(due.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {collectingDue && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">গ্রাহক বকেয়া বিল আদায়</h3>
                <p className="text-xs text-white/80">{collectingDue.customerName}</p>
              </div>
              <button onClick={() => setCollectingDue(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="p-5 space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between">
                <span className="text-slate-500">বর্তমান অবশিষ্ট বকেয়া:</span>
                <span className="font-bold text-rose-600">{formatCurrency(collectingDue.currentDue)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আদায়কৃত টাকার পরিমাণ (BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={collectingDue.currentDue}
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-base font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পেমেন্ট মাধ্যম
                </label>
                <select
                  value={collectMethod}
                  onChange={(e) => setCollectMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                >
                  <option value="cash">নগদ (Cash)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCollectingDue(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  আদায় নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Due Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">নতুন গ্রাহক বকেয়া এন্ট্রি</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDue} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: হারুন মিয়া"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ফোন নম্বর</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">এলাকা / লাইন ঠিকানা</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="যেমন: ৩নং পশ্চিম ইলিশা / বাপ্তা"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বকেয়া টাকার পরিমাণ *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={totalDue}
                  onChange={(e) => setTotalDue(Number(e.target.value))}
                  placeholder="যেমন: ৮০০"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">মন্তব্য বা প্যাকেজ বিবরণ</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: অক্টোবর মাসের বিল বকেয়া"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
