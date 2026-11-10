import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, Zap } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, UserSession } from '../types';
import { CATEGORIES_EXPENSE, CATEGORIES_INCOME, toBengaliNumber } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  editingTx: Transaction | null;
  currentUser: UserSession;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTx,
  currentUser,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES_EXPENSE[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [addedBy, setAddedBy] = useState(currentUser.name);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setTitle(editingTx.title);
      setCategory(editingTx.category);
      setAmount(editingTx.amount);
      setDate(editingTx.date);
      setPaymentMethod((editingTx.paymentMethod as PaymentMethod) || 'cash');
      setAddedBy(editingTx.addedBy);
      setNote(editingTx.note || '');
    } else {
      setType(defaultType);
      setTitle('');
      setCategory(defaultType === 'income' ? CATEGORIES_INCOME[0] : CATEGORIES_EXPENSE[0]);
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('cash');
      setAddedBy(currentUser.name);
      setNote(defaultType === 'expense' ? 'দ্রুত খরচ এন্ট্রি' : 'দৈনিক আয় এন্ট্রি');
    }
    setError('');
  }, [editingTx, isOpen, defaultType, currentUser]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(CATEGORIES_INCOME[0]);
      setNote('দৈনিক আয় এন্ট্রি');
    } else {
      setCategory(CATEGORIES_EXPENSE[0]);
      setNote('দ্রুত খরচ এন্ট্রি');
    }
  };

  const handleQuickTitle = (presetTitle: string, presetCat: string) => {
    setTitle(presetTitle);
    setCategory(presetCat);
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('অনুগ্রহ করে বিবরণ / কাজের নাম লিখুন।');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('সঠিক টাকার পরিমাণ দিন (০ এর বেশি হতে হবে)।');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        id: editingTx ? editingTx.id : undefined,
        type,
        title: title.trim(),
        category,
        amount: Number(amount),
        date,
        paymentMethod,
        addedBy: addedBy.trim() || currentUser.name,
        addedById: currentUser.id,
        note: note.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'লেনদেন সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between text-white ${
          type === 'expense'
            ? 'bg-gradient-to-r from-rose-600 to-red-600'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
        }`}>
          <div className="flex items-center gap-2">
            {type === 'expense' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
            <div>
              <h2 className="text-lg font-bold">
                {editingTx ? 'লেনদেন সম্পাদনা' : type === 'expense' ? 'নতুন ব্যয় / খরচ এন্ট্রি' : 'নতুন আয় / জমা এন্ট্রি'}
              </h2>
              <p className="text-xs text-white/80">
                {currentUser.name} কর্তৃক এন্ট্রি হচ্ছে
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              ব্যয় / খরচ (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              আয় / জমা (Income)
            </button>
          </div>

          {/* Quick presets for technicians / line issues */}
          {type === 'expense' && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>জনপ্রিয় দ্রুত খরচ টেমপ্লেট:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { t: 'হোসেন ও রাজিব বিশ্বরোড লাইন সমস্যা', c: 'যাতায়াত ও ডেলিভারি খরচ' },
                  { t: 'গাড়ি পরানগন্জ নিয়ে যাওয়া ও আসা', c: 'যাতায়াত ও ডেলিভারি খরচ' },
                  { t: 'আকাস ও অন্তর লাইন সমস্যা বাপ্তা', c: 'যাতায়াত ও ডেলিভারি খরচ' },
                  { t: 'ভোলা সদর হারুন এর লাইন সমস্যা', c: 'যাতায়াত ও ডেলিভারি খরচ' },
                  { t: 'নাস্তা ও চা বিল', c: 'আপ্যায়ন ও নাস্তা খরচ' },
                  { t: 'সেলটেক পাওয়ার এর কাজ', c: 'যাতায়াত ও ডেলিভারি খরচ' }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickTitle(preset.t, preset.c)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors"
                  >
                    {preset.t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount input & quick amount buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              টাকার পরিমাণ (BDT) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-lg">৳</span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="যেমন: ৫০০"
                required
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-bold text-slate-900"
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[40, 50, 80, 100, 160, 450, 1000, 4000, 8000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="text-[11px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                >
                  +{toBengaliNumber(val)}৳
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              বিবরণ / কাজের বিবরণ *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'expense' ? 'যেমন: লাইন সমস্যা মেরামত বা মালামাল কেনা' : 'যেমন: গ্রাহক মাসিক বিল আদায়'}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-800"
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ক্যাটাগরি
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm text-slate-800 bg-white"
              >
                {(type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পেমেন্ট মাধ্যম
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm text-slate-800 bg-white"
              >
                <option value="cash">নগদ (Cash)</option>
                <option value="bkash">বিকাশ (bKash)</option>
                <option value="nagad">নগদ (Nagad)</option>
                <option value="bank">ব্যাংক ট্রান্সফার (Bank)</option>
                <option value="rocket">রকেট (Rocket)</option>
              </select>
            </div>
          </div>

          {/* Date & Added By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                তারিখ (Date)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                এন্ট্রিদাতা (Added By)
              </label>
              <input
                type="text"
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
                placeholder="এন্ট্রিদাতার নাম"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মন্তব্য / নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: দ্রুত খরচ এন্ট্রি বা বিশেষ কাজের বিবরণ"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-800"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingTx ? 'আপডেট করুন' : 'নিশ্চিত ও সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
