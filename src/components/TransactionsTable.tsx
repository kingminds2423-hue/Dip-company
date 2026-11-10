import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  Trash2,
  Edit,
  ArrowUpDown,
  Calendar,
  User,
  Tag,
  CreditCard
} from 'lucide-react';
import { Transaction, UserSession } from '../types';
import {
  formatCurrency,
  toBengaliNumber,
  formatBengaliDate,
  CATEGORIES_EXPENSE,
  CATEGORIES_INCOME
} from '../utils/formatters';

interface TransactionsTableProps {
  transactions: Transaction[];
  currentUser: UserSession;
  onOpenAddModal: (type: 'income' | 'expense') => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCsv: () => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  currentUser,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterPerson, setFilterPerson] = useState<string>('all');

  // Extract distinct months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        months.add(tx.date.substring(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Extract distinct addedBy names
  const availablePersons = useMemo(() => {
    const persons = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.addedBy) persons.add(tx.addedBy);
    });
    return Array.from(persons);
  }, [transactions]);

  // Filtered list
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
      if (filterMonth !== 'all' && !tx.date.startsWith(filterMonth)) return false;
      if (filterPerson !== 'all' && tx.addedBy !== filterPerson) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (tx.title || '').toLowerCase().includes(q);
        const noteMatch = (tx.note || '').toLowerCase().includes(q);
        const idMatch = (tx.id || '').toLowerCase().includes(q);
        const catMatch = (tx.category || '').toLowerCase().includes(q);
        const personMatch = (tx.addedBy || '').toLowerCase().includes(q);
        if (!titleMatch && !noteMatch && !idMatch && !catMatch && !personMatch) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filterType, filterCategory, filterMonth, filterPerson, search]);

  // Totals for filtered list
  const totals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredList.forEach((tx) => {
      if (tx.type === 'income') inc += tx.amount;
      else exp += tx.amount;
    });
    return {
      income: inc,
      expense: exp,
      net: inc - exp,
    };
  }, [filteredList]);

  const allCategories = useMemo(() => {
    return Array.from(new Set([...CATEGORIES_EXPENSE, ...CATEGORIES_INCOME]));
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>দৈনিক আয়-ব্যয় খাতা (Transactions Ledger)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {toBengaliNumber(filteredList.length)} টি রেকর্ড
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ফিল্টার করা মোট জমা: <span className="text-emerald-600 font-bold">{formatCurrency(totals.income)}</span> | মোট খরচ: <span className="text-rose-600 font-bold">{formatCurrency(totals.expense)}</span> | নিট: <span className={`font-bold ${totals.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(totals.net)}</span>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onExportCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 flex items-center gap-1.5"
            title="CSV ফাইলে ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
            CSV এক্সপোর্ট
          </button>
          <button
            onClick={() => onOpenAddModal('income')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + জমা এন্ট্রি
          </button>
          <button
            onClick={() => onOpenAddModal('expense')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Minus className="w-3.5 h-3.5" />
            - খরচ এন্ট্রি
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="বিবরণ, মন্তব্য বা আইডি দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সব ধরনের হিসাব (All)</option>
              <option value="expense">ব্যয় / খরচ (Expense)</option>
              <option value="income">আয় / জমা (Income)</option>
            </select>
          </div>

          {/* Month filter */}
          <div>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সব মাস (All Months)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {toBengaliNumber(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Added By Person filter */}
          <div>
            <select
              value={filterPerson}
              onChange={(e) => setFilterPerson(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সকল এন্ট্রিদাতা</option>
              {availablePersons.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">ক্যাটাগরি:</span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সব ক্যাটাগরি
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">ক্রমিক</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">ধরন</th>
                <th className="py-3 px-4">কাজের বিবরণ / খাত</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4 text-right">টাকার পরিমাণ</th>
                <th className="py-3 px-4">পেমেন্ট</th>
                <th className="py-3 px-4">এন্ট্রিদাতা</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    কোনো তথ্য খুঁজে পাওয়া যায়নি। অনুসন্ধান পরিবর্তন করুন বা নতুন এন্ট্রি দিন।
                  </td>
                </tr>
              ) : (
                filteredList.map((tx, idx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-medium">
                        {toBengaliNumber(idx + 1)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="font-semibold">{tx.date}</div>
                        <div className="text-[10px] text-slate-400">{formatBengaliDate(tx.date)}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {isIncome ? '+ জমা (Income)' : '- খরচ (Expense)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium max-w-xs">
                        <div className="font-semibold text-slate-900">{tx.title}</div>
                        {tx.note && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            নোট: {tx.note}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {tx.id}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-extrabold text-sm sm:text-base">
                        <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap text-xs">
                        {tx.paymentMethod === 'bkash' ? 'বিকাশ (bKash)' : tx.paymentMethod === 'nagad' ? 'নগদ (Nagad)' : tx.paymentMethod === 'bank' ? 'ব্যাংক' : 'নগদ ক্যাশ'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="font-medium text-xs">{tx.addedBy}</div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি নিশ্চিতভাবে "${tx.title}" লেনদেনটি মুছে ফেলতে চান?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
